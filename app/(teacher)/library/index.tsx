// app/(teacher)/library/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  fileUrl: string;
  coverImage: string;
  categoryId: number;
  category: { name: string; color: string };
  grade: number | null;
  subject: string;
  isPublished: boolean;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface Class {
  id: number;
  name: string;
  section: string;
}

export default function TeacherLibraryScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    fileUrl: "",
    categoryId: "",
    classId: "",
    subject: "",
    grade: "",
    coverImage: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksRes, categoriesRes, classesRes] = await Promise.all([
        apiRequest("/teacher/library/books"),
        apiRequest("/teacher/library/categories"),
        apiRequest("/teacher/library/classes"),
      ]);

      if (booksRes.success) setBooks(booksRes.data?.books || []);
      if (categoriesRes.success) setCategories(categoriesRes.data || []);
      if (classesRes.success) setClasses(classesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddBook = async () => {
    if (!formData.title || !formData.fileUrl || !formData.categoryId) {
      Alert.alert("خطا", "لطفا عنوان، لینک و دسته‌بندی را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest("/teacher/library/books", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          author: formData.author || "معلم مدرسه",
          description: formData.description,
          fileUrl: formData.fileUrl,
          categoryId: parseInt(formData.categoryId),
          classId: formData.classId ? parseInt(formData.classId) : null,
          subject: formData.subject,
          grade: formData.grade ? parseInt(formData.grade) : null,
          coverImage: formData.coverImage || null,
        }),
      });

      if (response.success) {
        Alert.alert("موفقیت", "کتاب با موفقیت اضافه شد");
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert("خطا", response.message || "مشکلی در افزودن کتاب پیش آمد");
      }
    } catch (error) {
      Alert.alert("خطا", "مشکلی در افزودن کتاب پیش آمد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = (bookId: number, bookTitle: string) => {
    Alert.alert(
      "حذف کتاب",
      `آیا از حذف کتاب "${bookTitle}" اطمینان دارید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await apiRequest(`/teacher/library/books/${bookId}`, {
                method: "DELETE",
              });
              if (response.success) {
                Alert.alert("موفقیت", "کتاب با موفقیت حذف شد");
                loadData();
              } else {
                Alert.alert("خطا", response.message || "مشکلی در حذف کتاب پیش آمد");
              }
            } catch (error) {
              Alert.alert("خطا", "مشکلی در حذف کتاب پیش آمد");
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      fileUrl: "",
      categoryId: "",
      classId: "",
      subject: "",
      grade: "",
      coverImage: "",
    });
  };

  const renderBookCard = ({ item }: { item: Book }) => (
    <View style={styles.bookCard}>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>{item.author}</Text>
        <View style={styles.bookMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: `${item.category?.color || Colors.primary}20` }]}>
            <Text style={[styles.categoryText, { color: item.category?.color || Colors.primary }]}>
              {item.category?.name || "عمومی"}
            </Text>
          </View>
          {item.grade && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>پایه {item.grade}</Text>
            </View>
          )}
        </View>
        <Text style={styles.bookLink} numberOfLines={1}>
          <Ionicons name="link" size={12} color={Colors.textSecondary} />
          {" "}{item.fileUrl}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteBook(item.id, item.title)}
      >
        <Ionicons name="trash-outline" size={22} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="مدیریت کتابخانه"
        rightComponent={
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{books.length}</Text>
            <Text style={styles.statLabel}>کل کتاب‌ها</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{categories.length}</Text>
            <Text style={styles.statLabel}>دسته‌بندی</Text>
          </View>
        </View>

        <View style={styles.booksContainer}>
          <Text style={styles.sectionTitle}>کتاب‌های کتابخانه</Text>
          {books.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>هیچ کتابی یافت نشد</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.addButtonText}>افزودن کتاب جدید</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={books}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBookCard}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Add Book Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>افزودن کتاب جدید</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>عنوان کتاب *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="مثال: ریاضی پایه هفتم"
                textAlign="right"
              />

              <Text style={styles.label}>نویسنده</Text>
              <TextInput
                style={styles.input}
                value={formData.author}
                onChangeText={(text) => setFormData({ ...formData, author: text })}
                placeholder="نام نویسنده"
                textAlign="right"
              />

              <Text style={styles.label}>لینک کتاب (تلگرام، PDF، و...) *</Text>
              <TextInput
                style={styles.input}
                value={formData.fileUrl}
                onChangeText={(text) => setFormData({ ...formData, fileUrl: text })}
                placeholder="https://t.me/... یا https://example.com/book.pdf"
                textAlign="left"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                می‌توانید لینک تلگرام، لینک فایل PDF یا هر لینک دیگری وارد کنید
              </Text>

              <Text style={styles.label}>دسته‌بندی *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      formData.categoryId === cat.id.toString() && styles.categoryOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, categoryId: cat.id.toString() })}
                  >
                    <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    <Text style={styles.categoryOptionText}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>صنف (اختیاری)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classesScroll}>
                <TouchableOpacity
                  style={[
                    styles.classOption,
                    formData.classId === "" && styles.classOptionActive,
                  ]}
                  onPress={() => setFormData({ ...formData, classId: "" })}
                >
                  <Text style={styles.classOptionText}>همه صنوف</Text>
                </TouchableOpacity>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.classOption,
                      formData.classId === cls.id.toString() && styles.classOptionActive,
                    ]}
                    onPress={() => setFormData({ ...formData, classId: cls.id.toString() })}
                  >
                    <Text style={styles.classOptionText}>{cls.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>پایه تحصیلی (اختیاری)</Text>
              <TextInput
                style={styles.input}
                value={formData.grade}
                onChangeText={(text) => setFormData({ ...formData, grade: text })}
                placeholder="مثال: 7"
                keyboardType="numeric"
                textAlign="right"
              />

              <Text style={styles.label}>توضیحات (اختیاری)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="توضیحات درباره کتاب"
                multiline
                numberOfLines={3}
                textAlign="right"
              />

              <Text style={styles.label}>لینک تصویر جلد (اختیاری)</Text>
              <TextInput
                style={styles.input}
                value={formData.coverImage}
                onChangeText={(text) => setFormData({ ...formData, coverImage: text })}
                placeholder="https://example.com/cover.jpg"
                textAlign="left"
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalSubmitButton, submitting && styles.modalSubmitButtonDisabled]}
              onPress={handleAddBook}
              disabled={submitting}
            >
              <Text style={styles.modalSubmitButtonText}>
                {submitting ? "در حال افزودن..." : "افزودن کتاب"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  booksContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "right",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "right",
  },
  bookAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: "right",
  },
  bookMeta: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  gradeBadge: {
    backgroundColor: `${Colors.primary}20`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 10,
    color: Colors.primary,
  },
  bookLink: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  deleteButton: {
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: "hidden",
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
    textAlign: "right",
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  helperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "right",
  },
  categoriesScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 6,
  },
  categoryOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  categoryOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  classesScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  classOption: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  classOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  classOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: "center",
  },
  modalSubmitButtonDisabled: {
    opacity: 0.6,
  },
  modalSubmitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});