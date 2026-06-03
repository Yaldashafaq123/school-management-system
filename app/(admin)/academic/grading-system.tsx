// app/(admin)/academic/grading.tsx
import {
  adminGradingApi,
  Grade,
  GradingScheme,
} from "@/src/config/adminGradingApi";
import {
  Award,
  Calculator,
  Check,
  Download,
  Edit2,
  Plus,
  Trash2,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface GradeInput {
  id: string;
  range: string;
  grade: string;
  points: string;
  remark: string;
}

export default function GradingSystem() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gradingSchemes, setGradingSchemes] = useState<GradingScheme[]>([]);
  const [activeSchemeId, setActiveSchemeId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState<GradingScheme | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [gradeInputs, setGradeInputs] = useState<GradeInput[]>([]);

  const [newScheme, setNewScheme] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "letter" | "points",
    passingGrade: "",
    isDefault: false,
    grades: [] as Grade[],
  });

  const [testPercentage, setTestPercentage] = useState("");
  const [calculatedGrade, setCalculatedGrade] = useState<Grade | null>(null);

  const gradeTypes = [
    {
      id: "percentage",
      label: "درصدی",
      description: "درجه‌ها بر اساس محدوده درصدی",
    },
    { id: "letter", label: "حرفی", description: "درجه‌ها بر اساس حروف" },
    {
      id: "points",
      label: "امتیازی",
      description: "درجه‌ها بر اساس محدوده امتیازی",
    },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminGradingApi.getGradingSchemes();
      if (response.success && response.data) {
        setGradingSchemes(response.data);
        const defaultScheme = response.data.find((s) => s.isDefault);
        if (defaultScheme) {
          setActiveSchemeId(defaultScheme.id);
        } else if (response.data.length > 0) {
          setActiveSchemeId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading grading schemes:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const initializeGradeInputs = (grades: Grade[] = []) => {
    if (grades.length > 0) {
      setGradeInputs(
        grades.map((g, i) => ({
          id: `${Date.now()}-${i}`,
          range: g.range,
          grade: g.grade,
          points: g.points.toString(),
          remark: g.remark,
        })),
      );
    } else {
      setGradeInputs([
        {
          id: Date.now().toString(),
          range: "",
          grade: "",
          points: "",
          remark: "",
        },
      ]);
    }
  };

  const addGradeInput = () => {
    setGradeInputs([
      ...gradeInputs,
      {
        id: Date.now().toString(),
        range: "",
        grade: "",
        points: "",
        remark: "",
      },
    ]);
  };

  const removeGradeInput = (id: string) => {
    if (gradeInputs.length > 1) {
      setGradeInputs(gradeInputs.filter((g) => g.id !== id));
    } else {
      Alert.alert("خطا", "حداقل یک محدوده درجه الزامی است");
    }
  };

  const updateGradeInput = (
    id: string,
    field: keyof GradeInput,
    value: string,
  ) => {
    setGradeInputs(
      gradeInputs.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    );
  };

  const validateGrades = () => {
    for (let i = 0; i < gradeInputs.length; i++) {
      const g = gradeInputs[i];
      if (!g.range.trim()) {
        Alert.alert("خطا", `محدوده را برای درجه ${i + 1} وارد کنید`);
        return false;
      }
      if (!g.grade.trim()) {
        Alert.alert("خطا", `درجه را برای ردیف ${i + 1} وارد کنید`);
        return false;
      }
      if (!g.points || isNaN(parseFloat(g.points))) {
        Alert.alert("خطا", `امتیاز معتبر برای درجه ${i + 1} وارد کنید`);
        return false;
      }
      if (!g.remark.trim()) {
        Alert.alert("خطا", `توضیح را برای درجه ${i + 1} وارد کنید`);
        return false;
      }
    }

    if (newScheme.type === "percentage") {
      const ranges = gradeInputs.map((g) =>
        g.range.split("-").map((n) => parseInt(n.trim())),
      );
      for (let i = 0; i < ranges.length - 1; i++) {
        if (ranges[i][1] + 1 !== ranges[i + 1][0]) {
          Alert.alert("خطا", "محدوده‌های درصدی باید پیوسته و بدون فاصله باشند");
          return false;
        }
      }
    }
    return true;
  };

  const handleSaveScheme = async () => {
    if (!newScheme.name.trim()) {
      Alert.alert("خطا", "نام سیستم را وارد کنید");
      return;
    }
    if (!newScheme.passingGrade) {
      Alert.alert("خطا", "درجه قبولی را وارد کنید");
      return;
    }
    if (!validateGrades()) return;

    const finalGrades: Grade[] = gradeInputs.map((g) => ({
      range: g.range,
      grade: g.grade,
      points: parseFloat(g.points),
      remark: g.remark,
    }));

    const passingGradeValue =
      newScheme.type === "percentage"
        ? parseInt(newScheme.passingGrade)
        : newScheme.passingGrade;

    const schemeData = {
      name: newScheme.name,
      description: newScheme.description,
      type: newScheme.type,
      passingGrade: passingGradeValue.toString(),
      isDefault: newScheme.isDefault,
      grades: finalGrades,
    };

    setSubmitting(true);
    try {
      let response;
      if (editingScheme) {
        response = await adminGradingApi.updateGradingScheme(
          editingScheme.id,
          schemeData,
        );
      } else {
        response = await adminGradingApi.createGradingScheme(schemeData);
      }

      if (response.success) {
        Alert.alert("موفقیت", response.message);
        resetForm();
        loadData();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در ذخیره سیستم");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (scheme: GradingScheme) => {
    setEditingScheme(scheme);
    setNewScheme({
      name: scheme.name,
      description: scheme.description,
      type: scheme.type,
      passingGrade: scheme.passingGrade.toString(),
      isDefault: scheme.isDefault,
      grades: [],
    });
    initializeGradeInputs(scheme.grades);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    const scheme = gradingSchemes.find((s) => s.id === id);
    if (scheme?.isDefault) {
      Alert.alert("امکان حذف نیست", "سیستم پیش‌فرض قابل حذف نیست");
      return;
    }

    Alert.alert("حذف سیستم", "آیا مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminGradingApi.deleteGradingScheme(id);
            if (response.success) {
              Alert.alert("موفقیت", response.message);
              loadData();
            } else {
              Alert.alert("خطا", response.message);
            }
          } catch (error) {
            Alert.alert("خطا", "خطا در حذف سیستم");
          }
        },
      },
    ]);
  };

  const setAsDefault = async (id: string) => {
    try {
      const response = await adminGradingApi.setDefaultGradingScheme(id);
      if (response.success) {
        Alert.alert("موفقیت", response.message);
        loadData();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در تنظیم سیستم پیش‌فرض");
    }
  };

  const resetForm = () => {
    setNewScheme({
      name: "",
      description: "",
      type: "percentage",
      passingGrade: "",
      isDefault: false,
      grades: [],
    });
    setGradeInputs([
      {
        id: Date.now().toString(),
        range: "",
        grade: "",
        points: "",
        remark: "",
      },
    ]);
    setEditingScheme(null);
    setShowAddModal(false);
  };

  const handleCalculate = async () => {
    const perc = parseFloat(testPercentage);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      Alert.alert("خطا", "عدد بین ۰ تا ۱۰۰ وارد کنید");
      return;
    }

    try {
      const response = await adminGradingApi.calculateGrade(
        perc,
        activeSchemeId,
      );
      if (response.success && response.data) {
        setCalculatedGrade({
          grade: response.data.grade,
          points: response.data.points,
          remark: response.data.remark,
          range: response.data.range,
        });
      } else {
        Alert.alert("خطا", "درجه‌ای یافت نشد");
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در محاسبه درجه");
    }
  };

  const activeScheme = gradingSchemes.find((s) => s.id === activeSchemeId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>سیستم درجه‌دهی</Text>
            <Text style={styles.subtitle}>
              مدیریت و تنظیم سیستم‌های درجه‌دهی
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>سیستم جدید</Text>
          </TouchableOpacity>
        </View>

        {/* Schemes Grid */}
        <View style={styles.schemesContainer}>
          <Text style={styles.sectionTitle}>سیستم‌های درجه‌دهی</Text>
          <View style={styles.schemesGrid}>
            {gradingSchemes.map((scheme) => (
              <TouchableOpacity
                key={scheme.id}
                style={[
                  styles.schemeCard,
                  activeSchemeId === scheme.id && styles.schemeCardActive,
                  scheme.isDefault && styles.schemeCardDefault,
                ]}
                onPress={() => setActiveSchemeId(scheme.id)}
              >
                <View style={styles.schemeHeader}>
                  <View style={styles.schemeIcon}>
                    <Award
                      size={20}
                      color={scheme.isDefault ? "#34C759" : "#007AFF"}
                    />
                  </View>
                  <View style={styles.schemeInfo}>
                    <Text style={styles.schemeName}>{scheme.name}</Text>
                    <Text style={styles.schemeDescription}>
                      {scheme.description}
                    </Text>
                  </View>
                  {scheme.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>پیش‌فرض</Text>
                    </View>
                  )}
                </View>

                <View style={styles.schemeStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{scheme.grades.length}</Text>
                    <Text style={styles.statLabel}>درجه‌ها</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {scheme.type === "percentage"
                        ? `${scheme.passingGrade}٪`
                        : scheme.passingGrade}
                    </Text>
                    <Text style={styles.statLabel}>قبولی</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {scheme.type === "percentage"
                        ? "درصدی"
                        : scheme.type === "letter"
                          ? "حرفی"
                          : "امتیازی"}
                    </Text>
                    <Text style={styles.statLabel}>نوع</Text>
                  </View>
                </View>

                <View style={styles.schemeActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(scheme)}
                  >
                    <Edit2 size={16} color="#007AFF" />
                    <Text style={styles.actionText}>ویرایش</Text>
                  </TouchableOpacity>
                  {!scheme.isDefault && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(scheme.id)}
                    >
                      <Trash2 size={16} color="#FF3B30" />
                      <Text style={[styles.actionText, styles.deleteText]}>
                        حذف
                      </Text>
                    </TouchableOpacity>
                  )}
                  {!scheme.isDefault && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setAsDefault(scheme.id)}
                    >
                      <Check size={16} color="#34C759" />
                      <Text style={[styles.actionText, { color: "#34C759" }]}>
                        پیش‌فرض کن
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculator */}
        <View style={styles.calculatorContainer}>
          <View style={styles.calculatorCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Calculator
                size={20}
                color="#007AFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.calculatorTitle}>ماشین حساب درجه</Text>
            </View>
            <Text style={styles.calculatorDescription}>
              درصد را وارد کنید تا درجه معادل محاسبه شود
            </Text>

            <View style={styles.calculatorInput}>
              <TextInput
                style={styles.percentageInput}
                placeholder="درصد را وارد کنید (۰-۱۰۰)"
                keyboardType="numeric"
                value={testPercentage}
                onChangeText={setTestPercentage}
              />
              <TouchableOpacity
                style={styles.calculateButton}
                onPress={handleCalculate}
              >
                <Text style={styles.calculateText}>محاسبه</Text>
              </TouchableOpacity>
            </View>

            {calculatedGrade && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>نتیجه</Text>
                <View style={styles.resultCard}>
                  <View style={styles.resultGrade}>
                    <Text style={styles.resultGradeText}>
                      {calculatedGrade.grade}
                    </Text>
                    <Text style={styles.resultPoints}>
                      {calculatedGrade.points} امتیاز
                    </Text>
                  </View>
                  <View style={styles.resultDetails}>
                    <Text style={styles.resultRemark}>
                      {calculatedGrade.remark}
                    </Text>
                    <Text style={styles.resultRange}>
                      محدوده: {calculatedGrade.range}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Grade Table */}
        <View style={styles.gradeTableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.sectionTitle}>مقیاس درجه‌ها</Text>
            <TouchableOpacity style={styles.exportButton}>
              <Download size={16} color="#007AFF" />
              <Text style={styles.exportText}>خروجی</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableHeaderCell}>محدوده</Text>
              <Text style={styles.tableHeaderCell}>درجه</Text>
              <Text style={styles.tableHeaderCell}>امتیاز</Text>
              <Text style={styles.tableHeaderCell}>توضیح</Text>
              <Text style={styles.tableHeaderCell}>وضعیت</Text>
            </View>

            {activeScheme?.grades.map((grade, index) => {
              const isPassing =
                activeScheme.type === "percentage"
                  ? parseFloat(grade.range.split("-")[0]) >=
                    Number(activeScheme.passingGrade)
                  : grade.points > 0;

              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{grade.range}</Text>
                  <Text style={styles.tableCell}>{grade.grade}</Text>
                  <Text style={styles.tableCell}>
                    {grade.points.toFixed(1)}
                  </Text>
                  <Text style={styles.tableCell}>{grade.remark}</Text>
                  <View style={styles.statusCell}>
                    {isPassing ? (
                      <View style={styles.passBadge}>
                        <Check size={12} color="#34C759" />
                        <Text style={styles.passText}>قبول</Text>
                      </View>
                    ) : (
                      <View style={styles.failBadge}>
                        <X size={12} color="#FF3B30" />
                        <Text style={styles.failText}>ناکام</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            <View style={styles.tableFooter}>
              <Text style={styles.footerText}>
                درجه قبولی:{" "}
                {activeScheme?.type === "percentage"
                  ? `≥ ${activeScheme.passingGrade}٪`
                  : activeScheme?.passingGrade}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingScheme
                  ? "ویرایش سیستم درجه‌دهی"
                  : "سیستم درجه‌دهی جدید"}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={resetForm}>
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.formSectionTitle}>اطلاعات پایه</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>نام سیستم *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="مثال: سیستم درجه‌دهی استاندارد"
                    value={newScheme.name}
                    onChangeText={(text) =>
                      setNewScheme({ ...newScheme, name: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>توضیحات</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="این سیستم درجه‌دهی را شرح دهید..."
                    multiline
                    numberOfLines={3}
                    value={newScheme.description}
                    onChangeText={(text) =>
                      setNewScheme({ ...newScheme, description: text })
                    }
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>نوع درجه‌دهی *</Text>
                  <View style={styles.typeGrid}>
                    {gradeTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        style={[
                          styles.typeButton,
                          newScheme.type === type.id && styles.typeButtonActive,
                        ]}
                        onPress={() =>
                          setNewScheme({ ...newScheme, type: type.id as any })
                        }
                      >
                        <Text
                          style={[
                            styles.typeLabel,
                            newScheme.type === type.id &&
                              styles.typeLabelActive,
                          ]}
                        >
                          {type.label}
                        </Text>
                        <Text style={styles.typeDescription}>
                          {type.description}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>درجه قبولی *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      newScheme.type === "percentage" ? "مثال: ۴۰" : "مثال: د"
                    }
                    value={newScheme.passingGrade}
                    onChangeText={(text) =>
                      setNewScheme({ ...newScheme, passingGrade: text })
                    }
                    keyboardType={
                      newScheme.type === "percentage" ? "numeric" : "default"
                    }
                  />
                </View>
              </View>

              <View style={styles.formSection}>
                <View style={styles.gradesHeader}>
                  <Text style={styles.formSectionTitle}>محدوده‌های درجه</Text>
                  <TouchableOpacity
                    style={styles.addGradeButton}
                    onPress={addGradeInput}
                  >
                    <Plus size={16} color="#007AFF" />
                    <Text style={styles.addGradeText}>اضافه کردن درجه</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.gradesDescription}>
                  تمام محدوده‌های درجه را از بالا به پایین تعریف کنید
                </Text>

                <View style={styles.gradesTable}>
                  <View style={styles.gradesTableHeaderRow}>
                    <Text style={styles.gradesTableHeaderCellSmall}>
                      محدوده *
                    </Text>
                    <Text style={styles.gradesTableHeaderCellSmall}>
                      درجه *
                    </Text>
                    <Text style={styles.gradesTableHeaderCellSmall}>
                      امتیاز *
                    </Text>
                    <Text style={styles.gradesTableHeaderCellSmall}>
                      توضیح *
                    </Text>
                    <Text style={styles.gradesTableHeaderCellSmall}></Text>
                  </View>

                  {gradeInputs.map((grade, index) => (
                    <View key={grade.id} style={styles.gradeInputRow}>
                      <TextInput
                        style={styles.gradeInput}
                        placeholder={
                          newScheme.type === "percentage"
                            ? "مثال: ۱۰۰-۹۰"
                            : "مثال: آ+"
                        }
                        value={grade.range}
                        onChangeText={(text) =>
                          updateGradeInput(grade.id, "range", text)
                        }
                      />
                      <TextInput
                        style={styles.gradeInput}
                        placeholder="مثال: آ+"
                        value={grade.grade}
                        onChangeText={(text) =>
                          updateGradeInput(grade.id, "grade", text)
                        }
                      />
                      <TextInput
                        style={styles.gradeInput}
                        placeholder="مثال: ۴.۰"
                        value={grade.points}
                        onChangeText={(text) =>
                          updateGradeInput(grade.id, "points", text)
                        }
                        keyboardType="numeric"
                      />
                      <TextInput
                        style={styles.gradeInput}
                        placeholder="مثال: عالی"
                        value={grade.remark}
                        onChangeText={(text) =>
                          updateGradeInput(grade.id, "remark", text)
                        }
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeGradeInput(grade.id)}
                      >
                        <Trash2 size={14} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <View style={styles.defaultContainer}>
                  <View style={styles.defaultInfo}>
                    <Text style={styles.defaultLabel}>
                      تنظیم به عنوان سیستم پیش‌فرض
                    </Text>
                    <Text style={styles.defaultDescription}>
                      این سیستم به عنوان سیستم پیش‌فرض برای تمام صنف‌ها استفاده
                      خواهد شد
                    </Text>
                  </View>
                  <Switch
                    value={newScheme.isDefault}
                    onValueChange={(value) =>
                      setNewScheme({ ...newScheme, isDefault: value })
                    }
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={newScheme.isDefault ? "#007AFF" : "#f4f3f4"}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  submitting && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveScheme}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingScheme ? "بروزرسانی سیستم" : "ایجاد سیستم"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1d1d1f",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  schemesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 16,
  },
  schemesGrid: {
    gap: 16,
  },
  schemeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  schemeCardActive: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  schemeCardDefault: {
    borderWidth: 2,
    borderColor: "#34C759",
  },
  schemeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  schemeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  schemeInfo: {
    flex: 1,
  },
  schemeName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  schemeDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  defaultBadge: {
    backgroundColor: "#D4F7E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },
  schemeStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  schemeActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#007AFF",
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
  },
  deleteText: {
    color: "#FF3B30",
  },
  calculatorContainer: {
    padding: 20,
    paddingTop: 0,
  },
  calculatorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  calculatorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
  },
  calculatorDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  calculatorInput: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  percentageInput: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1d1d1f",
    textAlign: "right",
  },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  calculateText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  resultContainer: {
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 8,
  },
  resultCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  resultGrade: {
    alignItems: "center",
    marginRight: 16,
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: "#e5e5ea",
  },
  resultGradeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007AFF",
  },
  resultPoints: {
    fontSize: 14,
    color: "#8E8E93",
  },
  resultDetails: {
    flex: 1,
  },
  resultRemark: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  resultRange: {
    fontSize: 14,
    color: "#8E8E93",
  },
  gradeTableContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exportText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  table: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#1d1d1f",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#1d1d1f",
    textAlign: "center",
  },
  statusCell: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  passBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D4F7E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  passText: {
    fontSize: 12,
    color: "#34C759",
    fontWeight: "500",
  },
  failBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  failText: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "500",
  },
  tableFooter: {
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f7",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  footerText: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1d1d1f",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1d1d1f",
    textAlign: "right",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  typeButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#E8F4FF",
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 8,
  },
  typeLabelActive: {
    color: "#007AFF",
  },
  typeDescription: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  gradesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addGradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addGradeText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  gradesDescription: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  gradesTable: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    overflow: "hidden",
  },
  gradesTableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#e5e5ea",
    padding: 12,
  },
  gradesTableHeaderCellSmall: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#1d1d1f",
    textAlign: "center",
  },
  gradeInputRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
    alignItems: "center",
  },
  gradeInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    color: "#1d1d1f",
    marginHorizontal: 2,
    textAlign: "right",
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  defaultContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
  },
  defaultInfo: {
    flex: 1,
    marginRight: 16,
  },
  defaultLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  defaultDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f2f2f7",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
