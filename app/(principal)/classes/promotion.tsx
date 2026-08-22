// app/(principal)/classes/promotion.tsx

import { principalApi } from "@/src/config/principalApi";
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
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type PromotionOption = {
  fromClassId: number;
  fromClassName: string;
  fromGrade: string;
  fromSection: string;
  fromStudentCount: number;
  fromTeacher: string;
  currentAcademicYear: string;
  currentAcademicYearId: number | null;
  nextGradeName: string | null;
  toClassId: number | null;
  toClassName: string | null;
  toStudentCount: number;
  toTeacher: string;
  toAcademicYear: string;
  canPromote: boolean;
  hasStudents: boolean;
  needsNewClass: boolean;
  suggestedNewClassName: string | null;
  suggestedNewGrade: string | null;
  suggestedNewSection: string;
  targetAcademicYearId: number | null;
};

type AcademicYear = {
  id: number;
  name: string;
  isActive: boolean;
};

export default function ClassPromotionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [promotionOptions, setPromotionOptions] = useState<PromotionOption[]>(
    [],
  );
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<
    number | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionOption | null>(null);
  const [promoting, setPromoting] = useState(false);

  // New class creation states
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newGrade, setNewGrade] = useState("");
  const [newSection, setNewSection] = useState("");
  const [targetAcademicYearId, setTargetAcademicYearId] = useState<
    number | null
  >(null);

  useEffect(() => {
    fetchPromotionOptions();
  }, [selectedAcademicYear]);

  const fetchPromotionOptions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📚 Fetching promotion options...');
      
      const response = await principalApi.getClassPromotionOptions({
        academicYearId: selectedAcademicYear || undefined,
      });

      console.log('📚 Promotion response:', JSON.stringify(response, null, 2));

      if (response.success) {
        setPromotionOptions(response.data.promotionSuggestions || []);
        setAcademicYears(response.data.academicYears || []);
        
        // Set default target academic year
        if (response.data.academicYears && response.data.academicYears.length > 0) {
          const activeYear = response.data.academicYears.find((y: any) => y.isActive);
          setTargetAcademicYearId(activeYear?.id || response.data.academicYears[0]?.id || null);
        }
      } else {
        setError(response.message || 'خطا در دریافت اطلاعات');
        Alert.alert("خطا", response.message || "خطا در دریافت اطلاعات ارتقا");
      }
    } catch (error: any) {
      console.error("Error fetching promotion options:", error);
      setError(error.message || 'خطا در ارتباط با سرور');
      Alert.alert("خطا", error.message || "خطا در دریافت اطلاعات ارتقا");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPromotionOptions();
  };

  const handlePromoteClass = (promotion: PromotionOption) => {
    if (!promotion.hasStudents) {
      Alert.alert("توجه", "این صنف هیچ شاگردی ندارد");
      return;
    }

    setSelectedPromotion(promotion);

    if (promotion.needsNewClass && !promotion.canPromote) {
      // Open new class creation modal
      setNewGrade(promotion.suggestedNewGrade || "");
      setNewSection(promotion.suggestedNewSection || "");
      setNewClassName(promotion.suggestedNewClassName || "");

      // Get active academic year
      const activeYear = academicYears.find((y) => y.isActive);
      setTargetAcademicYearId(activeYear?.id || academicYears[0]?.id || null);

      setShowNewClassModal(true);
    } else if (promotion.canPromote) {
      // Show promotion confirmation
      setShowPromotionModal(true);
    } else {
      Alert.alert("خطا", "امکان ارتقا این صنف وجود ندارد");
    }
  };

  const confirmPromotion = async (createNew: boolean = false) => {
    if (!selectedPromotion) return;

    setPromoting(true);
    try {
      const data: any = {
        fromClassId: selectedPromotion.fromClassId,
        notes: `ارتقا از ${selectedPromotion.fromClassName}`,
      };

      if (createNew) {
        if (!newGrade.trim()) {
          Alert.alert("خطا", "لطفاً نام صنف جدید را وارد کنید");
          setPromoting(false);
          return;
        }
        
        data.createNewClass = true;
        data.newGrade = newGrade.trim();
        data.newSection = newSection.trim() || "";
        data.newClassName = newGrade.trim() + (newSection.trim() ? ` ${newSection.trim()}` : "");
        data.academicYearId = targetAcademicYearId || undefined;
      } else {
        if (!selectedPromotion.toClassId) {
          Alert.alert("خطا", "صنف مقصد مشخص نشده است");
          setPromoting(false);
          return;
        }
        data.toClassId = selectedPromotion.toClassId;
        data.academicYearId = selectedPromotion.currentAcademicYearId || undefined;
      }

      console.log('📤 Promoting class with data:', data);

      const response = await principalApi.promoteClass(data);

      if (response.success) {
        Alert.alert(
          "موفقیت",
          response.message ||
            `${selectedPromotion.fromStudentCount} شاگرد با موفقیت ارتقا یافتند`,
          [
            {
              text: "باشه",
              onPress: () => {
                setShowPromotionModal(false);
                setShowNewClassModal(false);
                setSelectedPromotion(null);
                fetchPromotionOptions();
              },
            },
          ],
        );
      } else {
        Alert.alert("خطا", response.message || "خطا در ارتقا صنف");
      }
    } catch (error: any) {
      console.error("Error promoting class:", error);
      Alert.alert("خطا", error.message || "خطا در ارتقا صنف");
    } finally {
      setPromoting(false);
    }
  };

  const renderPromotionCard = (promotion: PromotionOption) => {
    const canPromote = promotion.canPromote || promotion.needsNewClass;
    const hasStudents = promotion.hasStudents;

    return (
      <TouchableOpacity
        key={promotion.fromClassId}
        style={[
          styles.promotionCard,
          !canPromote && styles.disabledCard,
          !hasStudents && styles.emptyCard,
        ]}
        onPress={() => handlePromoteClass(promotion)}
        activeOpacity={0.7}
        disabled={!canPromote || !hasStudents}
      >
        {/* From Class */}
        <View style={styles.promotionRow}>
          <View style={styles.classColumn}>
            <Text style={styles.classLabel}>از</Text>
            <Text style={styles.className}>{promotion.fromClassName}</Text>
            <Text style={styles.classDetails}>
              {promotion.fromStudentCount} شاگرد • {promotion.fromTeacher}
            </Text>
            <Text style={styles.academicYearText}>
              {promotion.currentAcademicYear || "سال تحصیلی نامشخص"}
            </Text>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={28} color="#f59e0b" />
          </View>

          {/* To Class */}
          <View style={styles.classColumn}>
            <Text style={styles.classLabel}>به</Text>
            {promotion.needsNewClass ? (
              <View style={styles.newClassContainer}>
                <Ionicons name="add-circle" size={24} color="#3b82f6" />
                <Text style={styles.newClassText}>
                  {promotion.suggestedNewClassName || "ایجاد صنف جدید"}
                </Text>
              </View>
            ) : promotion.canPromote ? (
              <>
                <Text style={styles.className}>{promotion.toClassName}</Text>
                <Text style={styles.classDetails}>
                  {promotion.toStudentCount} شاگرد • {promotion.toTeacher}
                </Text>
                <Text style={styles.academicYearText}>
                  {promotion.toAcademicYear || "سال تحصیلی نامشخص"}
                </Text>
              </>
            ) : (
              <Text style={styles.noPromotionText}>امکان ارتقا وجود ندارد</Text>
            )}
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.promotionFooter}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: promotion.needsNewClass
                  ? "#dbeafe"
                  : promotion.canPromote
                    ? "#d1fae5"
                    : "#fef3c7",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: promotion.needsNewClass
                    ? "#3b82f6"
                    : promotion.canPromote
                      ? "#10b981"
                      : "#f59e0b",
                },
              ]}
            >
              {promotion.needsNewClass
                ? "ایجاد صنف جدید"
                : promotion.canPromote
                  ? "قابل ارتقا"
                  : "غیرقابل ارتقا"}
            </Text>
          </View>
          <Text style={styles.studentCount}>
            {promotion.fromStudentCount} شاگرد
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ارتقا صنوف</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#f59e0b" />
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchPromotionOptions} style={styles.errorRetry}>
            <Text style={styles.errorRetryText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Academic Year Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedAcademicYear && styles.filterChipActive,
          ]}
          onPress={() => setSelectedAcademicYear(null)}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedAcademicYear && styles.filterChipTextActive,
            ]}
          >
            همه
          </Text>
        </TouchableOpacity>
        {academicYears.map((year) => (
          <TouchableOpacity
            key={year.id}
            style={[
              styles.filterChip,
              selectedAcademicYear === year.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedAcademicYear(year.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedAcademicYear === year.id && styles.filterChipTextActive,
              ]}
            >
              {year.name} {year.isActive && "✓"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Promotion List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {promotionOptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="rocket-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>
              هیچ صنفی برای ارتقا موجود نیست
            </Text>
            <Text style={styles.emptyText}>
              صنف‌هایی که شاگرد فعال دارند و می‌توانند به صنف بالاتر ارتقا پیدا
              کنند در اینجا نمایش داده می‌شوند.
            </Text>
          </View>
        ) : (
          promotionOptions.map((promotion) => renderPromotionCard(promotion))
        )}
      </ScrollView>

      {/* Promotion Confirmation Modal */}
      <Modal
        visible={showPromotionModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPromotionModal(false);
          setSelectedPromotion(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تأیید ارتقا</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowPromotionModal(false);
                  setSelectedPromotion(null);
                }}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedPromotion && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  آیا از ارتقا صنف{" "}
                  <Text style={styles.boldText}>
                    {selectedPromotion.fromClassName}
                  </Text>{" "}
                  به{" "}
                  <Text style={styles.boldText}>
                    {selectedPromotion.toClassName}
                  </Text>{" "}
                  مطمئن هستید؟
                </Text>
                <Text style={styles.modalSubText}>
                  {selectedPromotion.fromStudentCount} شاگرد به صنف جدید منتقل
                  خواهند شد.
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => {
                      setShowPromotionModal(false);
                      setSelectedPromotion(null);
                    }}
                  >
                    <Text style={styles.cancelModalButtonText}>لغو</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmModalButton]}
                    onPress={() => confirmPromotion(false)}
                    disabled={promoting}
                  >
                    {promoting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmModalButtonText}>ارتقا</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* New Class Creation Modal */}
      <Modal
        visible={showNewClassModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowNewClassModal(false);
          setSelectedPromotion(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ایجاد صنف جدید</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowNewClassModal(false);
                  setSelectedPromotion(null);
                }}
              >
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedPromotion && (
              <View style={styles.modalBody}>
                <Text style={styles.modalText}>
                  برای ارتقا صنف{" "}
                  <Text style={styles.boldText}>
                    {selectedPromotion.fromClassName}
                  </Text>
                  ، باید یک صنف جدید ایجاد کنید.
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>نام صنف جدید</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newGrade}
                    onChangeText={setNewGrade}
                    placeholder="مثال: چهارم"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>بخش (اختیاری)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={newSection}
                    onChangeText={setNewSection}
                    placeholder="مثال: الف, ب, ج"
                    placeholderTextColor="#94a3b8"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>سال تحصیلی</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.academicYearOptions}>
                      {academicYears.map((year) => (
                        <TouchableOpacity
                          key={year.id}
                          style={[
                            styles.academicYearOption,
                            targetAcademicYearId === year.id &&
                              styles.academicYearOptionActive,
                          ]}
                          onPress={() => setTargetAcademicYearId(year.id)}
                        >
                          <Text
                            style={[
                              styles.academicYearOptionText,
                              targetAcademicYearId === year.id &&
                                styles.academicYearOptionTextActive,
                            ]}
                          >
                            {year.name} {year.isActive && "✓"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelModalButton]}
                    onPress={() => {
                      setShowNewClassModal(false);
                      setSelectedPromotion(null);
                    }}
                  >
                    <Text style={styles.cancelModalButtonText}>لغو</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmModalButton]}
                    onPress={() => confirmPromotion(true)}
                    disabled={promoting || !newGrade.trim()}
                  >
                    {promoting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.confirmModalButtonText}>
                        ایجاد و ارتقا
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
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
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  refreshButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    flexWrap: "wrap",
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#dc2626",
    fontSize: 14,
    fontFamily: "Vazir",
  },
  errorRetry: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#dc2626",
    borderRadius: 6,
  },
  errorRetryText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Vazir",
  },
  filterContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    maxHeight: 56,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterChipActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  filterChipText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  promotionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  disabledCard: {
    opacity: 0.5,
  },
  emptyCard: {
    opacity: 0.4,
  },
  promotionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  classColumn: {
    flex: 1,
    alignItems: "center",
  },
  classLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginBottom: 4,
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  classDetails: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    textAlign: "center",
    marginTop: 2,
  },
  academicYearText: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  arrowContainer: {
    paddingHorizontal: 12,
  },
  newClassContainer: {
    alignItems: "center",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newClassText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  noPromotionText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  promotionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  studentCount: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    fontFamily: "VazirBold",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
    fontFamily: "Vazir",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    color: "#1e293b",
    textAlign: "center",
    fontFamily: "Vazir",
    lineHeight: 24,
  },
  modalSubText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 8,
    fontFamily: "Vazir",
  },
  boldText: {
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    fontFamily: "VazirBold",
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#fff",
    fontFamily: "Vazir",
  },
  academicYearOptions: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  academicYearOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },
  academicYearOptionActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  academicYearOptionText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  academicYearOptionTextActive: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelModalButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "Vazir",
  },
  confirmModalButton: {
    backgroundColor: "#f59e0b",
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Vazir",
  },
});