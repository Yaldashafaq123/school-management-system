// app/(admin)/financial/fees/templates/create.tsx
import { AmountInput } from "@/components/finance/AmountInput";
import { AcademicYear, ClassItem, financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface TemplateItemInput {
  feeType: string;
  name: string;
  amount: string;
  isRecurring: boolean;
  isMandatory: boolean;
  description?: string;
}

export default function CreateTemplateScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Form
  const [name, setName] = useState("");
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<TemplateItemInput[]>([]);

  // New item
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [itemType, setItemType] = useState("MONTHLY_TUITION");
  const [itemRecurring, setItemRecurring] = useState(false);
  const [itemMandatory, setItemMandatory] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [yearsRes, classesRes] = await Promise.all([
        financeApi.getAcademicYears(),
        financeApi.getClassesList(),
      ]);
      if (yearsRes.success) {
        setAcademicYears(yearsRes.data);
        const active = yearsRes.data.find((y) => y.isActive);
        if (active) setSelectedYearId(active.id);
      }
      if (classesRes.success) setClasses(classesRes.data);
    } catch (error) {
      console.error("Load data error:", error);
    }
  };

  const feeTypes = [
    { value: "MONTHLY_TUITION", label: "شهریه ماهانه", recurring: true },
    { value: "MONTHLY_TRANSPORT", label: "حمل و نقل", recurring: true },
    { value: "ONE_TIME_ADMISSION", label: "پذیرش", recurring: false },
    { value: "ONE_TIME_REGISTRATION", label: "ثبت نام", recurring: false },
    { value: "ONE_TIME_BOOKS", label: "کتاب‌ها", recurring: false },
    { value: "ONE_TIME_UNIFORM", label: "یونیفورم", recurring: false },
    { value: "ONE_TIME_EXAM", label: "امتحان", recurring: false },
    { value: "OTHER", label: "سایر", recurring: false },
  ];

  const addItem = () => {
    if (!itemName || !itemAmount || Number(itemAmount) <= 0) {
      Alert.alert("خطا", "نام و مبلغ را وارد کنید");
      return;
    }
    setItems([
      ...items,
      {
        feeType: itemType,
        name: itemName,
        amount: itemAmount,
        isRecurring: itemRecurring,
        isMandatory: itemMandatory,
        description: "",
      },
    ]);
    setItemName("");
    setItemAmount("");
    setShowAddItem(false);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSelectType = (type: string) => {
    setItemType(type);
    const found = feeTypes.find((t) => t.value === type);
    if (found) {
      setItemRecurring(found.recurring);
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("خطا", "نام قالب را وارد کنید");
      return;
    }
    if (!selectedYearId) {
      Alert.alert("خطا", "سال تعلیمی را انتخاب کنید");
      return;
    }
    if (items.length === 0) {
      Alert.alert("خطا", "حداقل یک قلم اضافه کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await financeApi.createFeeTemplate({
        name,
        academicYearId: selectedYearId,
        classId: selectedClassId || undefined,
        description: description || undefined,
        items: items.map((item) => ({
          feeType: item.feeType,
          name: item.name,
          amount: Number(item.amount),
          isRecurring: item.isRecurring,
          isMandatory: item.isMandatory,
        })),
      });

      if (response.success) {
        Alert.alert("موفقیت", "قالب با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ایجاد قالب با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>قالب فیس جدید</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نام قالب</Text>
          <TextInput
            style={styles.input}
            placeholder="مثلاً: فیس صنف ۸ - ۱۴۰۳"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            textAlign="right"
          />
        </View>

        {/* Academic Year */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سال تعلیمی</Text>
          <View style={styles.chipGrid}>
            {academicYears.map((year) => (
              <TouchableOpacity
                key={year.id}
                style={[
                  styles.chip,
                  selectedYearId === year.id && styles.chipActive,
                ]}
                onPress={() => setSelectedYearId(year.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedYearId === year.id && styles.chipTextActive,
                  ]}
                >
                  {year.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Class */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صنف (اختیاری)</Text>
          <View style={styles.chipGrid}>
            <TouchableOpacity
              style={[styles.chip, !selectedClassId && styles.chipActive]}
              onPress={() => setSelectedClassId(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  !selectedClassId && styles.chipTextActive,
                ]}
              >
                همه صنوف
              </Text>
            </TouchableOpacity>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.chip,
                  selectedClassId === cls.id && styles.chipActive,
                ]}
                onPress={() => setSelectedClassId(cls.id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedClassId === cls.id && styles.chipTextActive,
                  ]}
                >
                  {cls.name} {cls.section}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fee Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اقلام فیس</Text>

          {items.map((item, index) => (
            <View key={index} style={styles.feeItemCard}>
              <View style={styles.feeItemHeader}>
                <View
                  style={[
                    styles.feeItemIcon,
                    {
                      backgroundColor: item.isRecurring ? "#fef3c7" : "#dbeafe",
                    },
                  ]}
                >
                  <Ionicons
                    name={item.isRecurring ? "repeat" : "receipt-outline"}
                    size={18}
                    color={item.isRecurring ? "#d97706" : "#3b82f6"}
                  />
                </View>
                <View style={styles.feeItemInfo}>
                  <Text style={styles.feeItemName}>{item.name}</Text>
                  <Text style={styles.feeItemType}>
                    {item.isRecurring ? "ماهانه" : "یکباره"}
                    {item.isMandatory ? " • اجباری" : " • اختیاری"}
                  </Text>
                </View>
                <View style={styles.feeItemAmountContainer}>
                  <Text style={styles.feeItemAmount}>
                    {Number(item.amount).toLocaleString()} افغانی
                  </Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          {/* Add Item Form */}
          {showAddItem ? (
            <View style={styles.addItemForm}>
              <TextInput
                style={styles.input}
                placeholder="نام قلم"
                placeholderTextColor="#94a3b8"
                value={itemName}
                onChangeText={setItemName}
                textAlign="right"
              />
              <AmountInput
                value={itemAmount}
                onChangeText={setItemAmount}
                placeholder="مبلغ"
              />

              <Text style={styles.subLabel}>نوع فیس</Text>
              <View style={styles.typeGrid}>
                {feeTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      itemType === type.value && styles.typeChipActive,
                    ]}
                    onPress={() => handleSelectType(type.value)}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        itemType === type.value && styles.typeChipTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setItemMandatory(!itemMandatory)}
              >
                <Ionicons
                  name={itemMandatory ? "checkbox" : "square-outline"}
                  size={20}
                  color={itemMandatory ? "#3b82f6" : "#94a3b8"}
                />
                <Text style={styles.checkboxText}>اجباری</Text>
              </TouchableOpacity>

              <View style={styles.addItemActions}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  onPress={addItem}
                >
                  <Text style={styles.btnPrimaryText}>اضافه کردن</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  onPress={() => setShowAddItem(false)}
                >
                  <Text style={styles.btnSecondaryText}>لغو</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addItemTrigger}
              onPress={() => setShowAddItem(true)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#06b6d4" />
              <Text style={styles.addItemTriggerText}>اضافه کردن قلم</Text>
            </TouchableOpacity>
          )}

          {items.length > 0 && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>مجموع:</Text>
              <Text style={styles.totalAmount}>
                {totalAmount.toLocaleString()} افغانی
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات (اختیاری)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="توضیحات قالب..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlign="right"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Submit */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={22} color="#fff" />
              <Text style={styles.submitText}>ذخیره قالب</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scrollView: { flex: 1 },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    marginBottom: 8,
  },
  textArea: {
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
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipActive: { backgroundColor: "#eff6ff", borderColor: "#3b82f6" },
  chipText: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  chipTextActive: { color: "#3b82f6", fontWeight: "600" },
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    fontFamily: "Vazir",
    marginTop: 12,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  typeChipActive: { backgroundColor: "#eff6ff", borderColor: "#3b82f6" },
  typeChipText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  typeChipTextActive: { color: "#3b82f6", fontWeight: "600" },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  checkboxText: { fontSize: 14, color: "#475569", fontFamily: "Vazir" },
  feeItemCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  feeItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  feeItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  feeItemInfo: { flex: 1 },
  feeItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  feeItemType: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  feeItemAmountContainer: { alignItems: "flex-end" },
  feeItemAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
    marginBottom: 4,
  },
  addItemForm: {
    marginTop: 8,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  addItemActions: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnPrimary: { backgroundColor: "#06b6d4" },
  btnPrimaryText: { color: "#fff", fontWeight: "600", fontFamily: "Vazir" },
  btnSecondary: { backgroundColor: "#e2e8f0" },
  btnSecondaryText: { color: "#64748b", fontFamily: "Vazir" },
  addItemTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#a5f3fc",
    borderStyle: "dashed",
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  addItemTriggerText: { fontSize: 15, color: "#06b6d4", fontFamily: "Vazir" },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#06b6d4",
    fontFamily: "VazirBold",
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    elevation: 4,
    shadowColor: "#06b6d4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
