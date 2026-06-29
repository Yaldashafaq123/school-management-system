// app/(teacher)/library/index.tsx (Updated version)

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import { apiRequest } from "../../../src/config/api";

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  categoryId: number;
  subject: string;
  grade: number;
  pages: number;
  fileSize: string;
  fileFormat: string;
  fileUrl: string;
  isPublished: boolean;
  createdAt: string;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

interface BookCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface ClassInfo {
  id: number;
  name: string;
  section?: string;
}

export default function TeacherLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    categoryId: "",
    subject: "",
    grade: "",
    fileUrl: "",
    coverImage: "",
    classId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchBooks(), fetchCategories(), fetchClasses()]);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await apiRequest("/teacher/library/books");
      console.log("Books response:", response);

      // Handle different response formats
      let booksData = [];
      if (response && response.success) {
        booksData = response.data || response.books || [];
      } else if (response && response.data) {
        booksData = response.data.books || response.data || [];
      } else if (Array.isArray(response)) {
        booksData = response;
      } else if (response && response.books) {
        booksData = response.books;
      }

      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
      setBooks([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiRequest("/teacher/library/categories");
      console.log("Categories response:", response);

      let categoriesData = [];
      if (response && response.success) {
        categoriesData = response.data || [];
      } else if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        // Default categories
        setCategories([
          { id: 1, name: "داستانی", icon: "book", color: "#FF6B6B" },
          { id: 2, name: "علمی", icon: "flask", color: "#4ECDC4" },
          { id: 3, name: "تاریخی", icon: "time", color: "#45B7D1" },
          { id: 4, name: "آموزشی", icon: "school", color: "#96CEB4" },
          { id: 5, name: "مذهبی", icon: "moon", color: "#FFEAA7" },
          { id: 6, name: "کودک", icon: "happy", color: "#DDA0DD" },
          { id: 7, name: "رمان", icon: "book", color: "#FF6B6B" },
          { id: 8, name: "شعر", icon: "musical-notes", color: "#F59E0B" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set default categories on error
      setCategories([
        { id: 1, name: "داستانی", icon: "book", color: "#FF6B6B" },
        { id: 2, name: "علمی", icon: "flask", color: "#4ECDC4" },
        { id: 3, name: "تاریخی", icon: "time", color: "#45B7D1" },
        { id: 4, name: "آموزشی", icon: "school", color: "#96CEB4" },
        { id: 5, name: "مذهبی", icon: "moon", color: "#FFEAA7" },
        { id: 6, name: "کودک", icon: "happy", color: "#DDA0DD" },
      ]);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiRequest("/teacher/library/classes");
      console.log("Classes response:", response);

      let classesData = [];
      if (response && response.success) {
        classesData = response.data || [];
      } else if (Array.isArray(response)) {
        classesData = response;
      }

      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddBook = async () => {
    // Validate form
    if (!formData.title) {
      Alert.alert("خطا", "لطفاً عنوان کتاب را وارد کنید");
      return;
    }

    if (!formData.fileUrl) {
      Alert.alert("خطا", "لطفاً لینک کتاب را وارد کنید");
      return;
    }

    if (!formData.categoryId) {
      Alert.alert("خطا", "لطفاً دسته‌بندی کتاب را انتخاب کنید");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest("/teacher/library/books", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          author: formData.author || "معلم مکتب",
          description: formData.description || "",
          categoryId: parseInt(formData.categoryId),
          subject: formData.subject || "",
          grade: formData.grade ? parseInt(formData.grade) : null,
          fileUrl: formData.fileUrl,
          coverImage: formData.coverImage || null,
          classId: formData.classId ? parseInt(formData.classId) : null,
        }),
      });

      console.log("Add book response:", response);

      if (response && response.success) {
        Alert.alert("موفقیت", "کتاب با موفقیت اضافه شد");
        setShowAddModal(false);
        resetForm();
        await fetchBooks();
      } else {
        Alert.alert("خطا", response?.message || "مشکلی در افزودن کتاب پیش آمد");
      }
    } catch (error: any) {
      console.error("Error adding book:", error);
      Alert.alert("خطا", error?.message || "مشکلی در افزودن کتاب پیش آمد");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      categoryId: "",
      subject: "",
      grade: "",
      fileUrl: "",
      coverImage: "",
      classId: "",
    });
  };

  const handleDeleteBook = (bookId: number, bookTitle: string) => {
    Alert.alert("حذف کتاب", `آیا از حذف کتاب "${bookTitle}" مطمئن هستید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await apiRequest(
              `/teacher/library/books/${bookId}`,
              {
                method: "DELETE",
              },
            );

            if (response && response.success) {
              Alert.alert("موفقیت", "کتاب با موفقیت حذف شد");
              await fetchBooks();
            } else {
              Alert.alert(
                "خطا",
                response?.message || "مشکلی در حذف کتاب پیش آمد",
              );
            }
          } catch (error) {
            console.error("Error deleting book:", error);
            Alert.alert("خطا", "مشکلی در حذف کتاب پیش آمد");
          }
        },
      },
    ]);
  };

  // Safely filter books - make sure books is an array
  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        const matchesCategory =
          selectedCategory === "all" ||
          book.categoryId?.toString() === selectedCategory;
        const matchesSearch =
          book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
    : [];

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "عمومی";
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.color || Colors.primary;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="کتابخانه دیجیتال" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="کتابخانه دیجیتال"
        rightComponent={
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی کتاب بر اساس عنوان یا نویسنده..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
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

        {/* Categories Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === "all" && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Ionicons
              name="grid"
              size={16}
              color={selectedCategory === "all" ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === "all" && styles.categoryTextActive,
              ]}
            >
              همه
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id.toString() &&
                  styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category.id.toString())}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={
                  selectedCategory === category.id.toString()
                    ? "#fff"
                    : Colors.text
                }
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id.toString() &&
                    styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books Count */}
        <View style={styles.countContainer}>
          <Text style={styles.countText}>
            {filteredBooks.length} کتاب یافت شد
          </Text>
        </View>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="library" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>کتابی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "با عبارت دیگری جستجو کنید"
                : "هنوز کتابی اضافه نشده است"}
            </Text>
            <TouchableOpacity
              style={styles.addBookButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add-circle" size={20} color="#fff" />
              <Text style={styles.addBookButtonText}>افزودن کتاب جدید</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.booksGrid}>
            {filteredBooks.map((book) => (
              <View key={book.id} style={styles.bookCard}>
                <View style={styles.bookHeader}>
                  <View
                    style={[
                      styles.bookIcon,
                      {
                        backgroundColor: `${getCategoryColor(book.categoryId)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="book"
                      size={32}
                      color={getCategoryColor(book.categoryId)}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteBook(book.id, book.title)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={Colors.danger}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor}>نویسنده: {book.author}</Text>

                {book.subject && (
                  <Text style={styles.bookSubject}>موضوع: {book.subject}</Text>
                )}

                {book.grade && (
                  <Text style={styles.bookGrade}>پایه: {book.grade}</Text>
                )}

                <View style={styles.bookMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons
                      name="folder"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.metaText}>
                      {getCategoryName(book.categoryId)}
                    </Text>
                  </View>
                  {book.pages && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="document-text"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.metaText}>{book.pages} صفحه</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    if (book.fileUrl) {
                      router.push({
                        pathname: "/(teacher)/book-viewer",
                        params: { url: book.fileUrl, title: book.title },
                      });
                    } else {
                      Alert.alert("خطا", "لینک کتاب موجود نیست");
                    }
                  }}
                >
                  <Ionicons name="eye" size={18} color="#fff" />
                  <Text style={styles.viewButtonText}>مشاهده کتاب</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.copyLinkButton}
                  onPress={() => {
                    if (book.fileUrl) {
                      Alert.alert("لینک کتاب", book.fileUrl);
                    }
                  }}
                >
                  <Ionicons name="link" size={16} color={Colors.primary} />
                  <Text style={styles.copyLinkText}>کپی لینک</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Book Modal - keep the same as before */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>افزودن کتاب جدید</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>عنوان کتاب *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="مثال: مثنوی معنوی"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نویسنده</Text>
              <TextInput
                style={styles.input}
                value={formData.author}
                onChangeText={(text) =>
                  setFormData({ ...formData, author: text })
                }
                placeholder="مثال: مولانا"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
              <Text style={styles.helperText}>
                اختیاری - در صورت خالی ماندن، نام معلم ثبت می‌شود
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>دسته‌بندی *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesRow}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryOption,
                        formData.categoryId === category.id.toString() &&
                          styles.categoryOptionActive,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          categoryId: category.id.toString(),
                        })
                      }
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={16}
                        color={
                          formData.categoryId === category.id.toString()
                            ? "#fff"
                            : Colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.categoryId === category.id.toString() &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>لینک کتاب *</Text>
              <TextInput
                style={styles.input}
                value={formData.fileUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, fileUrl: text })
                }
                placeholder="https://example.com/book.pdf"
                placeholderTextColor={Colors.textSecondary}
                textAlign="left"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                لینک مستقیم فایل PDF یا کتاب الکترونیکی
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>لینک تصویر جلد (اختیاری)</Text>
              <TextInput
                style={styles.input}
                value={formData.coverImage}
                onChangeText={(text) =>
                  setFormData({ ...formData, coverImage: text })
                }
                placeholder="https://example.com/cover.jpg"
                placeholderTextColor={Colors.textSecondary}
                textAlign="left"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>موضوع</Text>
                <TextInput
                  style={styles.input}
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  placeholder="مثال: ادبیات"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>پایه (اختیاری)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.grade}
                  onChangeText={(text) =>
                    setFormData({ ...formData, grade: text })
                  }
                  placeholder="مثال: 10"
                  placeholderTextColor={Colors.textSecondary}
                  keyboardType="numeric"
                  textAlign="right"
                />
              </View>
            </View>

            {classes.length > 0 && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>صنف (اختیاری)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoriesRow}>
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        formData.classId === "" && styles.categoryOptionActive,
                      ]}
                      onPress={() => setFormData({ ...formData, classId: "" })}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          formData.classId === "" &&
                            styles.categoryOptionTextActive,
                        ]}
                      >
                        همه صنوف
                      </Text>
                    </TouchableOpacity>
                    {classes.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[
                          styles.categoryOption,
                          formData.classId === cls.id.toString() &&
                            styles.categoryOptionActive,
                        ]}
                        onPress={() =>
                          setFormData({
                            ...formData,
                            classId: cls.id.toString(),
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.categoryOptionText,
                            formData.classId === cls.id.toString() &&
                              styles.categoryOptionTextActive,
                          ]}
                        >
                          {cls.name} {cls.section ? `- ${cls.section}` : ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>توضیحات (اختیاری)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="توضیحات کتاب..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.submitButtonDisabled,
              ]}
              onPress={handleAddBook}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>افزودن کتاب</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Styles remain the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 12,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  countContainer: {
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  addBookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addBookButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  booksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  bookCard: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    padding: 4,
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
  bookSubject: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bookGrade: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginBottom: 8,
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  copyLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  copyLinkText: {
    fontSize: 11,
    color: Colors.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  categoryOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  categoryOptionTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
