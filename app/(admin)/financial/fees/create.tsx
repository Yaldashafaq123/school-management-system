// app/(admin)/financial/fees/create.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  financeApi,
  FeeTemplate,
  AcademicYear,
  FeeCategory,
  FeeItemInput,
  formatCurrency,
} from "@/src/config/financeApi";

// ==================== COMPONENTS ====================

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <View style={skeletonStyles.container}>
    {[1, 2, 3, 4].map((i) => (
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
          <View style={[skeletonStyles.line, { width: "50%" }]} />
        </View>
      </View>
    ))}
  </View>
);

const skeletonStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
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
  headerText: {
    flex: 1,
    gap: 6,
  },
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
  body: {
    gap: 8,
  },
  line: {
    height: 12,
    width: "100%",
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
  },
});

// Empty State Component
const EmptyState = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}: {
  icon: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={emptyStateStyles.container}>
    <Ionicons name={icon as any} size={64} color="#cbd5e1" />
    <Text style={emptyStateStyles.title}>{title}</Text>
    <Text style={emptyStateStyles.subtitle}>{subtitle}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity style={emptyStateStyles.button} onPress={onAction}>
        <Text style={emptyStateStyles.buttonText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const emptyStateStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "VazirBold",
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontFamily: "Vazir",
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});

// ==================== MAIN SCREEN ====================

export default function CreateFeeAssignmentScreen() {
  const router = useRouter();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [categories, setCategories] = useState<FeeCategory[]>([]);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FeeTemplate | null>(
    null
  );
  const [selectedAcademicYear, setSelectedAcademicYear] =
    useState<AcademicYear | null>(null);
  const [useTemplate, setUseTemplate] = useState(true);
  const [feeItems, setFeeItems] = useState<FeeItemInput[]>([]);
  const [notes, setNotes] = useState("");

  // New item form
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemType, setNewItemType] = useState("ONE_TIME_ADMISSION");
  const [newItemRecurring, setNewItemRecurring] = useState(false);

  // ==================== LOAD DATA ====================

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("📡 Starting loadInitialData...");

      // Fetch all data in parallel
      const [templatesData, yearsData, categoriesData] = await Promise.all([
        financeApi.getFeeTemplates({ isActive: true }),
        financeApi.getAcademicYears(),
        financeApi.getFeeCategories(),
      ]);

      // Set templates
      console.log(`✅ Setting ${templatesData.length} templates`);
      setTemplates(templatesData);

      // Set academic years
      console.log(`✅ Setting ${yearsData.length} academic years`);
      setAcademicYears(yearsData);
      const activeYear = yearsData.find((y) => y.isActive);
      if (activeYear) {
        console.log("✅ Found active year:", activeYear.name);
        setSelectedAcademicYear(activeYear);
      }

      // Set categories
      console.log(`✅ Setting ${categoriesData.length} categories`);
      setCategories(categoriesData);
    } catch (error) {
      console.error("❌ Load data error:", error);
      setError("خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.");
      // Set empty arrays as fallback
      setTemplates([]);
      setAcademicYears([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==================== HANDLERS ====================

  const handleTemplateSelect = (template: FeeTemplate) => {
    setSelectedTemplate(template);
    setFeeItems(
      template.items.map((item) => ({
        feeType: item.feeType,
        name: item.name,
        amount: Number(item.amount),
        isRecurring: item.isRecurring,
      }))
    );
  };

  const addFeeItem = () => {
    if (!newItemName.trim() || !newItemAmount.trim()) {
      Alert.alert("خطا", "نام و مبلغ را وارد کنید");
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

    // Reset form
    setNewItemName("");
    setNewItemAmount("");
    setNewItemType("ONE_TIME_ADMISSION");
    setNewItemRecurring(false);
    setShowAddItem(false);
  };

  const removeFeeItem = (index: number) => {
    setFeeItems(feeItems.filter((_, i) => i !== index));
  };

  const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmit = async () => {
    if (!selectedStudent) {
      Alert.alert("خطا", "شاگرد را انتخاب کنید");
      return;
    }
    if (!selectedAcademicYear) {
      Alert.alert("خطا", "سال تعلیمی را انتخاب کنید");
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
        feeTemplateId: selectedTemplate?.id,
        items: feeItems,
        notes: notes || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "فیس با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
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
          <Text style={styles.headerTitle}>ایجاد فیس جدید</Text>
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
          <Text style={styles.headerTitle}>ایجاد فیس جدید</Text>
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
        <Text style={styles.headerTitle}>ایجاد فیس جدید</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Student Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>انتخاب شاگرد</Text>
          <TouchableOpacity
            style={styles.studentSelector}
            onPress={() => {
              // TODO: Navigate to student search
              Alert.alert("Info", "Student search will be implemented");
            }}
          >
            {selectedStudent ? (
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{selectedStudent.name}</Text>
                <Text style={styles.studentDetail}>
                  {selectedStudent.className || "بدون کلاس"}
                </Text>
              </View>
            ) : (
              <View style={styles.studentPlaceholder}>
                <Ionicons name="search-outline" size={20} color="#94a3b8" />
                <Text style={styles.studentPlaceholderText}>
                  جستجوی شاگرد...
                </Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Academic Year Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سال تعلیمی</Text>
          <View style={styles.yearGrid}>
            {academicYears.length === 0 ? (
              <Text style={styles.noDataText}>سال تعلیمی موجود نیست</Text>
            ) : (
              academicYears.map((year) => (
                <TouchableOpacity
                  key={year.id}
                  style={[
                    styles.yearCard,
                    selectedAcademicYear?.id === year.id &&
                      styles.yearCardActive,
                  ]}
                  onPress={() => setSelectedAcademicYear(year)}
                >
                  <Text
                    style={[
                      styles.yearName,
                      selectedAcademicYear?.id === year.id &&
                        styles.yearNameActive,
                    ]}
                  >
                    {year.name}
                  </Text>
                  {year.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>فعال</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Template or Manual */}
        <View style={styles.section}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                useTemplate && styles.toggleOptionActive,
              ]}
              onPress={() => {
                setUseTemplate(true);
                setFeeItems([]);
                setSelectedTemplate(null);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  useTemplate && styles.toggleTextActive,
                ]}
              >
                از قالب
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleOption,
                !useTemplate && styles.toggleOptionActive,
              ]}
              onPress={() => {
                setUseTemplate(false);
                setSelectedTemplate(null);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  !useTemplate && styles.toggleTextActive,
                ]}
              >
                دستی
              </Text>
            </TouchableOpacity>
          </View>

          {useTemplate ? (
            <View style={styles.templateGrid}>
              {templates.length === 0 ? (
                <EmptyState
                  icon="copy-outline"
                  title="قالبی موجود نیست"
                  subtitle="برای استفاده از قالب، ابتدا یک قالب فیس ایجاد کنید"
                />
              ) : (
                templates.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate?.id === template.id &&
                        styles.templateCardActive,
                    ]}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <View style={styles.templateHeader}>
                      <Ionicons
                        name="copy-outline"
                        size={24}
                        color={
                          selectedTemplate?.id === template.id
                            ? "#fff"
                            : "#3b82f6"
                        }
                      />
                      <View style={styles.templateBadge}>
                        <Text style={styles.templateBadgeText}>
                          {template.itemCount} قلم
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.templateName,
                        selectedTemplate?.id === template.id &&
                          styles.templateNameActive,
                      ]}
                    >
                      {template.name}
                    </Text>
                    <Text
                      style={[
                        styles.templateInfo,
                        selectedTemplate?.id === template.id &&
                          styles.templateInfoActive,
                      ]}
                    >
                      {formatCurrency(template.totalAmount)}
                    </Text>
                    {template.className && (
                      <Text
                        style={[
                          styles.templateClass,
                          selectedTemplate?.id === template.id &&
                            styles.templateClassActive,
                        ]}
                      >
                        {template.className}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            // Manual Items
            <View>
              {feeItems.map((item, index) => (
                <View key={index} style={styles.feeItem}>
                  <View style={styles.feeItemInfo}>
                    <View style={styles.feeItemIcon}>
                      <Ionicons
                        name={item.isRecurring ? "repeat" : "receipt-outline"}
                        size={20}
                        color="#3b82f6"
                      />
                    </View>
                    <View>
                      <Text style={styles.feeItemName}>{item.name}</Text>
                      <Text style={styles.feeItemType}>
                        {item.isRecurring ? "ماهانه" : "یکباره"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.feeItemAmount}>
                    <Text style={styles.feeItemAmountText}>
                      {formatCurrency(item.amount)}
                    </Text>
                    <TouchableOpacity onPress={() => removeFeeItem(index)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

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
                    placeholder="مبلغ"
                    placeholderTextColor="#94a3b8"
                    value={newItemAmount}
                    onChangeText={setNewItemAmount}
                    keyboardType="numeric"
                    textAlign="right"
                  />

                  <View style={styles.typeSelector}>
                    {categories.slice(0, 4).map((category) => (
                      <TouchableOpacity
                        key={category.value}
                        style={[
                          styles.typeOption,
                          newItemType === category.value &&
                            styles.typeOptionActive,
                        ]}
                        onPress={() => setNewItemType(category.value)}
                      >
                        <Text
                          style={[
                            styles.typeOptionText,
                            newItemType === category.value &&
                              styles.typeOptionTextActive,
                          ]}
                        >
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.recurringToggle,
                      newItemRecurring && styles.recurringToggleActive,
                    ]}
                    onPress={() => setNewItemRecurring(!newItemRecurring)}
                  >
                    <Ionicons
                      name={
                        newItemRecurring
                          ? "checkmark-circle"
                          : "ellipse-outline"
                      }
                      size={20}
                      color={newItemRecurring ? "#10b981" : "#94a3b8"}
                    />
                    <Text style={styles.recurringText}>
                      فیس ماهانه (تکراری)
                    </Text>
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
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color="#3b82f6"
                  />
                  <Text style={styles.addItemTriggerText}>
                    اضافه کردن قلم فیس
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
        {feeItems.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>خلاصه فیس</Text>
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
            {selectedStudent && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>شاگرد:</Text>
                <Text style={styles.summaryValue}>{selectedStudent.name}</Text>
              </View>
            )}
            {selectedAcademicYear && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>سال تعلیمی:</Text>
                <Text style={styles.summaryValue}>
                  {selectedAcademicYear.name}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Submit Button */}
      {feeItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitText}>ایجاد فیس</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },

  // Student Selector
  studentSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentDetail: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  studentPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  studentPlaceholderText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },

  // Academic Years
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  yearCardActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  yearName: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Vazir",
  },
  yearNameActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  activeBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 11,
    color: "#059669",
    fontFamily: "Vazir",
  },

  // Toggle
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleOptionActive: {
    backgroundColor: "#3b82f6",
  },
  toggleText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  toggleTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Templates
  templateGrid: {
    gap: 10,
  },
  templateCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  templateCardActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  templateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  templateBadge: {
    backgroundColor: "rgba(59,130,246,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  templateBadgeText: {
    fontSize: 12,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  templateName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  templateNameActive: {
    color: "#fff",
  },
  templateInfo: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  templateInfoActive: {
    color: "rgba(255,255,255,0.7)",
  },
  templateClass: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  templateClassActive: {
    color: "rgba(255,255,255,0.5)",
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
  feeItemInfo: {
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
  feeItemAmount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feeItemAmountText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },

  // Add Item
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
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  typeOptionActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  typeOptionText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  typeOptionTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
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
    marginBottom: 8,
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
    opacity: 0.6,
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
  noDataText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    fontFamily: "Vazir",
    paddingVertical: 12,
  },
});