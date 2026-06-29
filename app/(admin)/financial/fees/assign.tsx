// app/(admin)/financial/fees/assign.tsx
import {
    AcademicYear,
    ClassItem,
    FeeCategory,
    FeeItemInput,
    financeApi,
    formatCurrency,
    getFeeTypeIcon,
    getFeeTypeLabel,
    Student,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ==================== COMPONENTS ====================

// Loading Skeleton
const LoadingSkeleton = () => (
  <View style={skeletonStyles.container}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={skeletonStyles.card}>
        <View style={skeletonStyles.header}>
          <View style={skeletonStyles.avatar} />
          <View style={skeletonStyles.headerText}>
            <View style={skeletonStyles.title} />
            <View style={skeletonStyles.subtitle} />
          </View>
        </View>
        <View style={skeletonStyles.body}>
          <View style={skeletonStyles.line} />
          <View style={[skeletonStyles.line, { width: "70%" }]} />
        </View>
      </View>
    ))}
  </View>
);

const skeletonStyles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2e8f0",
  },
  headerText: { flex: 1, gap: 6 },
  title: {
    height: 16,
    width: "60%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
  subtitle: {
    height: 12,
    width: "40%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
  body: { gap: 8 },
  line: {
    height: 12,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
});

// Selection Modal Component
interface SelectionModalProps {
  visible: boolean;
  title: string;
  items: any[];
  selectedId?: number;
  onSelect: (item: any) => void;
  onClose: () => void;
  renderItem: (item: any) => React.ReactNode;
  keyExtractor: (item: any) => string;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  visible,
  title,
  items,
  selectedId,
  onSelect,
  onClose,
  renderItem,
  keyExtractor,
}) => (
  <Modal visible={visible} animationType="slide" transparent={true}>
    <View style={modalStyles.overlay}>
      <View style={modalStyles.content}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                modalStyles.item,
                selectedId === item.id && modalStyles.itemActive,
              ]}
              onPress={() => onSelect(item)}
            >
              {renderItem(item)}
              {selectedId === item.id && (
                <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={modalStyles.empty}>
              <Text style={modalStyles.emptyText}>موردی موجود نیست</Text>
            </View>
          )}
        />
      </View>
    </View>
  </Modal>
);

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    minHeight: "40%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemActive: {
    backgroundColor: "#eff6ff",
  },
  empty: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});

// Fee Type Selector
const FeeTypeSelector = ({
  selected,
  onSelect,
  categories,
}: {
  selected: string;
  onSelect: (value: string) => void;
  categories: FeeCategory[];
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={feeTypeStyles.container}
  >
    <View style={feeTypeStyles.row}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={[
            feeTypeStyles.option,
            selected === category.value && feeTypeStyles.optionActive,
          ]}
          onPress={() => onSelect(category.value)}
        >
          <Ionicons
            name={category.icon as any}
            size={20}
            color={selected === category.value ? "#3b82f6" : "#64748b"}
          />
          <Text
            style={[
              feeTypeStyles.optionText,
              selected === category.value && feeTypeStyles.optionTextActive,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

const feeTypeStyles = StyleSheet.create({
  container: { flexGrow: 0 },
  row: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  optionText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  optionTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});

// Helper to get student name safely
const getStudentName = (student: Student | null): string => {
  if (!student) return "انتخاب شاگرد";

  // Try different possible locations for the name
  const name =
    student.user?.fullName ||
    (student as any).fullName ||
    (student as any).name ||
    (student as any).full_name ||
    (student as any).studentName ||
    (student as any).user?.name ||
    (student as any).user?.full_name;

  return name || `دانش‌آموز #${student.id}`;
};

// ==================== MAIN SCREEN ====================

export default function AssignFeeScreen() {
  const router = useRouter();

  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  // Selection State
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<AcademicYear | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Modal Visibility
  const [showYearModal, setShowYearModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Fee Items
  const [feeItems, setFeeItems] = useState<FeeItemInput[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemType, setNewItemType] = useState("MONTHLY_TUITION");
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemRecurring, setNewItemRecurring] = useState(false);
  const [notes, setNotes] = useState("");

  // ==================== LOAD DATA ====================

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📡 Loading data for fee assignment...");

      const [yearsData, classesData, categoriesData] = await Promise.all([
        financeApi.getAcademicYears(),
        financeApi.getClasses(),
        financeApi.getFeeCategories(),
      ]);

      console.log(`✅ Loaded ${yearsData.length} academic years`);
      console.log(`✅ Loaded ${classesData.length} classes`);
      console.log(`✅ Loaded ${categoriesData.length} fee categories`);

      setAcademicYears(yearsData);
      setClasses(classesData);
      setCategories(categoriesData);

      // Auto-select active year
      const activeYear = yearsData.find((y) => y.isActive);
      if (activeYear) {
        setSelectedAcademicYear(activeYear);
      }

      // Auto-select first class if available
      if (classesData.length > 0) {
        setSelectedClass(classesData[0]);
        // Load students for first class
        const studentsData = await financeApi.getStudentsByClass(
          classesData[0].id,
        );
        setStudents(studentsData);
        console.log(
          `✅ Loaded ${studentsData.length} students for class ${classesData[0].name}`,
        );
        console.log(
          "📡 Sample student:",
          JSON.stringify(studentsData[0], null, 2),
        );
      }
    } catch (error) {
      console.error("❌ Load data error:", error);
      setError("خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== LOAD STUDENTS ON CLASS CHANGE ====================

  const handleClassSelect = useCallback(async (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setSelectedStudent(null);
    setStudents([]);
    setFeeItems([]);

    try {
      const studentsData = await financeApi.getStudentsByClass(classItem.id);
      setStudents(studentsData);
      console.log(
        `✅ Loaded ${studentsData.length} students for class ${classItem.name}`,
      );
      if (studentsData.length > 0) {
        console.log(
          "📡 Sample student:",
          JSON.stringify(studentsData[0], null, 2),
        );
      }
    } catch (error) {
      console.error("❌ Failed to load students:", error);
      Alert.alert("خطا", "بارگذاری دانش‌آموزان با مشکل مواجه شد");
    }
  }, []);

  // ==================== FEE ITEM HANDLERS ====================

  const addFeeItem = () => {
    if (!newItemName.trim()) {
      Alert.alert("خطا", "نام قلم فیس را وارد کنید");
      return;
    }

    const amount = Number(newItemAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("خطا", "مبلغ باید بیشتر از صفر باشد");
      return;
    }

    setFeeItems([
      ...feeItems,
      {
        feeType: newItemType,
        name: newItemName.trim(),
        amount,
        isRecurring: newItemRecurring,
      },
    ]);

    setNewItemName("");
    setNewItemAmount("");
    setNewItemType("MONTHLY_TUITION");
    setNewItemRecurring(false);
    setShowAddItem(false);
  };

  const removeFeeItem = (index: number) => {
    setFeeItems(feeItems.filter((_, i) => i !== index));
  };

  const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    if (!selectedStudent) {
      Alert.alert("خطا", "لطفاً یک دانش‌آموز انتخاب کنید");
      return;
    }
    if (!selectedAcademicYear) {
      Alert.alert("خطا", "لطفاً سال تعلیمی را انتخاب کنید");
      return;
    }
    if (feeItems.length === 0) {
      Alert.alert("خطا", "حداقل یک قلم فیس اضافه کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await financeApi.createFeeAssignment({
        studentId: selectedStudent.id,
        academicYearId: selectedAcademicYear.id,
        items: feeItems,
        notes: notes || undefined,
      });

      if (response.success) {
        Alert.alert(
          "موفقیت",
          `فیس با موفقیت برای ${getStudentName(selectedStudent)} ایجاد شد`,
          [{ text: "باشه", onPress: () => router.back() }],
        );
      } else {
        Alert.alert("خطا", "ایجاد فیس با مشکل مواجه شد");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ایجاد فیس با مشکل مواجه شد");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تعیین فیس</Text>
          <View style={{ width: 40 }} />
        </View>
        <LoadingSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تعیین فیس</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>تلاش دوباره</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تعیین فیس</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Step 1: Academic Year */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>۱</Text>
            </View>
            <Text style={styles.sectionTitle}>سال تعلیمی</Text>
          </View>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowYearModal(true)}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
              <Text style={styles.selectorText}>
                {selectedAcademicYear?.name || "انتخاب سال تعلیمی"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Step 2: Class */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>۲</Text>
            </View>
            <Text style={styles.sectionTitle}>صنف</Text>
          </View>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowClassModal(true)}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <Text style={styles.selectorText}>
                {selectedClass
                  ? `${selectedClass.name}${selectedClass.section ? ` - ${selectedClass.section}` : ""}`
                  : "انتخاب صنف"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </TouchableOpacity>
          {selectedClass && (
            <Text style={styles.studentCount}>
              {students.length} دانش‌آموز در این صنف
            </Text>
          )}
        </View>

        {/* Step 3: Student */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>۳</Text>
            </View>
            <Text style={styles.sectionTitle}>شاگرد</Text>
          </View>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              if (students.length === 0) {
                Alert.alert("اطلاعات", "ابتدا یک صنف انتخاب کنید");
                return;
              }
              setShowStudentModal(true);
            }}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <Text style={styles.selectorText}>
                {getStudentName(selectedStudent)}
              </Text>
              {selectedStudent && (
                <Text style={styles.studentClassTag}>
                  {selectedStudent.class?.name || ""}
                </Text>
              )}
            </View>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Step 4: Fee Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>۴</Text>
            </View>
            <Text style={styles.sectionTitle}>اقلام فیس</Text>
            <Text style={styles.itemCount}>{feeItems.length} قلم</Text>
          </View>

          {/* Fee Items List */}
          {feeItems.map((item, index) => (
            <View key={index} style={styles.feeItem}>
              <View style={styles.feeItemLeft}>
                <View style={styles.feeItemIcon}>
                  <Ionicons
                    name={getFeeTypeIcon(item.feeType) as any}
                    size={20}
                    color="#3b82f6"
                  />
                </View>
                <View>
                  <Text style={styles.feeItemName}>{item.name}</Text>
                  <Text style={styles.feeItemType}>
                    {getFeeTypeLabel(item.feeType)}
                    {item.isRecurring && " • ماهانه"}
                  </Text>
                </View>
              </View>
              <View style={styles.feeItemRight}>
                <Text style={styles.feeItemAmount}>
                  {formatCurrency(item.amount)}
                </Text>
                <TouchableOpacity onPress={() => removeFeeItem(index)}>
                  <Ionicons name="close-circle" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Fee Item */}
          {showAddItem ? (
            <View style={styles.addItemForm}>
              <TextInput
                style={styles.input}
                placeholder="نام قلم (مثلاً: شهریه ماهانه)"
                placeholderTextColor="#94a3b8"
                value={newItemName}
                onChangeText={setNewItemName}
                textAlign="right"
              />
              <TextInput
                style={styles.input}
                placeholder="مبلغ (افغانی)"
                placeholderTextColor="#94a3b8"
                value={newItemAmount}
                onChangeText={setNewItemAmount}
                keyboardType="numeric"
                textAlign="right"
              />

              <FeeTypeSelector
                selected={newItemType}
                onSelect={setNewItemType}
                categories={categories}
              />

              <TouchableOpacity
                style={[
                  styles.recurringToggle,
                  newItemRecurring && styles.recurringToggleActive,
                ]}
                onPress={() => setNewItemRecurring(!newItemRecurring)}
              >
                <Ionicons
                  name={
                    newItemRecurring ? "checkmark-circle" : "ellipse-outline"
                  }
                  size={20}
                  color={newItemRecurring ? "#10b981" : "#94a3b8"}
                />
                <Text style={styles.recurringText}>فیس ماهانه (تکراری)</Text>
              </TouchableOpacity>

              <View style={styles.addItemActions}>
                <TouchableOpacity
                  style={[styles.addItemButton, styles.addItemConfirm]}
                  onPress={addFeeItem}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.addItemButtonText}>اضافه</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addItemButton, styles.addItemCancel]}
                  onPress={() => setShowAddItem(false)}
                >
                  <Text style={styles.addItemButtonText}>لغو</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addItemTrigger}
              onPress={() => setShowAddItem(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
              <Text style={styles.addItemTriggerText}>اضافه کردن قلم فیس</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>یادداشت (اختیاری)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="یادداشت..."
            placeholderTextColor="#94a3b8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlign="right"
          />
        </View>

        {/* Summary */}
        {feeItems.length > 0 && selectedStudent && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>خلاصه فیس</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>شاگرد:</Text>
              <Text style={styles.summaryValue}>
                {getStudentName(selectedStudent)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>سال تعلیمی:</Text>
              <Text style={styles.summaryValue}>
                {selectedAcademicYear?.name}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>صنف:</Text>
              <Text style={styles.summaryValue}>
                {selectedClass?.name}
                {selectedClass?.section ? ` - ${selectedClass.section}` : ""}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>تعداد اقلام:</Text>
              <Text style={styles.summaryValue}>{feeItems.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>مجموع فیس:</Text>
              <Text style={styles.summaryValueBold}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (isSubmitting || feeItems.length === 0 || !selectedStudent) &&
              styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || feeItems.length === 0 || !selectedStudent}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitText}>ثبت فیس</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <SelectionModal
        visible={showYearModal}
        title="انتخاب سال تعلیمی"
        items={academicYears}
        selectedId={selectedAcademicYear?.id}
        onSelect={(year) => {
          setSelectedAcademicYear(year);
          setShowYearModal(false);
        }}
        onClose={() => setShowYearModal(false)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={(item) => (
          <View>
            <Text style={modalItemStyles.name}>{item.name}</Text>
            <Text style={modalItemStyles.sub}>
              {item.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        )}
      />

      <SelectionModal
        visible={showClassModal}
        title="انتخاب صنف"
        items={classes}
        selectedId={selectedClass?.id}
        onSelect={(classItem) => {
          handleClassSelect(classItem);
          setShowClassModal(false);
        }}
        onClose={() => setShowClassModal(false)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={(item) => (
          <View>
            <Text style={modalItemStyles.name}>
              {item.name}
              {item.section ? ` - ${item.section}` : ""}
            </Text>
            <Text style={modalItemStyles.sub}>
              {item.studentCount} دانش‌آموز
            </Text>
          </View>
        )}
      />

      <SelectionModal
        visible={showStudentModal}
        title="انتخاب شاگرد"
        items={students}
        selectedId={selectedStudent?.id}
        onSelect={(student) => {
          setSelectedStudent(student);
          setShowStudentModal(false);
        }}
        onClose={() => setShowStudentModal(false)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={(item) => {
          // Try multiple possible locations for the name
          const fullName =
            item.user?.fullName ||
            (item as any).fullName ||
            (item as any).name ||
            (item as any).full_name ||
            (item as any).studentName ||
            (item as any).user?.name ||
            (item as any).user?.full_name ||
            `دانش‌آموز #${item.id}`;

          const studentNumber =
            item.studentNumber ||
            (item as any).rollNumber ||
            (item as any).roll_number ||
            `شناسه: ${item.id}`;

          return (
            <View>
              <Text style={modalItemStyles.name}>{fullName}</Text>
              <Text style={modalItemStyles.sub}>{studentNumber}</Text>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const modalItemStyles = StyleSheet.create({
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  sub: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});

// ==================== STYLES ====================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    margin: 16,
    marginBottom: 12,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
    fontFamily: "VazirBold",
  },
  itemCount: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },

  // Selector
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  selectorText: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    flex: 1,
  },
  studentClassTag: {
    fontSize: 12,
    color: "#94a3b8",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontFamily: "Vazir",
  },
  studentCount: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 8,
    fontFamily: "Vazir",
  },

  // Fee Items
  feeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  feeItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feeItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  feeItemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  feeItemType: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  feeItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feeItemAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },

  // Add Item Form
  addItemForm: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    gap: 12,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  recurringToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recurringToggleActive: {
    opacity: 1,
  },
  recurringText: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Vazir",
  },
  addItemActions: {
    flexDirection: "row",
    gap: 8,
  },
  addItemButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addItemConfirm: {
    backgroundColor: "#10b981",
  },
  addItemCancel: {
    backgroundColor: "#64748b",
  },
  addItemButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  addItemTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#bfdbfe",
    borderStyle: "dashed",
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  addItemTriggerText: {
    fontSize: 15,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },

  // Notes
  notesInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    minHeight: 80,
    textAlignVertical: "top",
  },

  // Summary
  summaryCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#bfdbfe",
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    fontFamily: "VazirBold",
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    fontFamily: "Vazir",
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
