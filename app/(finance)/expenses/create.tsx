// app/(admin)/financial/expenses/create.tsx
import { AmountInput } from "@/components/finance/AmountInput";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateExpenseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form state
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await financeApi.getExpenseCategories();
      if (response.success) {
        setCategories(response.data || []);
        if (response.data?.length > 0) {
          setSelectedCategoryId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error("Load categories error:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطا", "دسترسی به گالری لازم است");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطا", "دسترسی به دوربین لازم است");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      Alert.alert("خطا", "دسته‌بندی را انتخاب کنید");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      Alert.alert("خطا", "مبلغ را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await financeApi.createExpense({
        categoryId: selectedCategoryId,
        amount: Number(amount),
        description: description || undefined,
        date: date.toISOString(),
        receiptUrl: receiptImage || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "مصرف با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ثبت مصرف با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>ثبت مصرف جدید</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Category Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>دسته‌بندی</Text>
            <TouchableOpacity
              onPress={() => router.push("/financial/expenses/categories")}
            >
              <Text style={styles.manageText}>مدیریت</Text>
            </TouchableOpacity>
          </View>

          {loadingCategories ? (
            <ActivityIndicator style={{ padding: 20 }} />
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategoryId === cat.id && styles.categoryCardActive,
                  ]}
                  onPress={() => setSelectedCategoryId(cat.id)}
                >
                  <Ionicons
                    name={getCategoryIcon(cat.name)}
                    size={24}
                    color={selectedCategoryId === cat.id ? "#fff" : "#64748b"}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      selectedCategoryId === cat.id &&
                        styles.categoryNameActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <AmountInput
            value={amount}
            onChangeText={setAmount}
            label="مبلغ مصرف"
            placeholder="مبلغ را وارد کنید"
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات</Text>
          <TextInput
            style={styles.textArea}
            placeholder="توضیحات مصرف را وارد کنید..."
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlign="right"
          />
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تاریخ</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(!showDatePicker)}
          >
            <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString("fa-AF", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Receipt Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رسید (اختیاری)</Text>

          {receiptImage ? (
            <View style={styles.receiptPreview}>
              <Image
                source={{ uri: receiptImage }}
                style={styles.receiptImage}
              />
              <TouchableOpacity
                style={styles.removeReceipt}
                onPress={() => setReceiptImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.receiptButtons}>
              <TouchableOpacity
                style={styles.receiptButton}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera-outline" size={28} color="#3b82f6" />
                <Text style={styles.receiptButtonText}>دوربین</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.receiptButton}
                onPress={handlePickImage}
              >
                <Ionicons name="images-outline" size={28} color="#8b5cf6" />
                <Text style={styles.receiptButtonText}>گالری</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
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
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.submitText}>
                ثبت مصرف {amount ? formatCurrency(Number(amount)) : ""}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    اجاره: "home-outline",
    معاش: "cash-outline",
    برق: "flash-outline",
    آب: "water-outline",
    انترنت: "wifi-outline",
    تعمیرات: "build-outline",
    لوازم: "cart-outline",
    "حمل و نقل": "car-outline",
    غذا: "restaurant-outline",
  };
  return icons[categoryName] || "receipt-outline";
}

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    fontFamily: "VazirBold",
  },
  manageText: {
    fontSize: 13,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryCard: {
    width: "30%",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  categoryCardActive: {
    backgroundColor: "#ef4444",
    borderColor: "#ef4444",
  },
  categoryName: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  categoryNameActive: {
    color: "#fff",
    fontWeight: "600",
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
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  receiptButtons: {
    flexDirection: "row",
    gap: 12,
  },
  receiptButton: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    gap: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  receiptPreview: {
    position: "relative",
  },
  receiptImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },
  removeReceipt: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
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
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
