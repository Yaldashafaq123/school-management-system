// app/(hr)/leaves/request.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
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

const LEAVE_TYPES = [
  { key: "ANNUAL", label: "مرخصی سالانه", icon: "calendar", color: "#3b82f6" },
  { key: "SICK", label: "مرخصی استعلاجی", icon: "medkit", color: "#10b981" },
  {
    key: "EMERGENCY",
    label: "مرخصی اضطرار",
    icon: "alert-circle",
    color: "#f59e0b",
  },
  { key: "MATERNITY", label: "مرخصی زایمان", icon: "heart", color: "#ef4444" },
];

export default function RequestLeaveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = async () => {
    if (!formData.userId || !formData.startDate || !formData.endDate) {
      Alert.alert("خطا", "لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            userId: parseInt(formData.userId),
            type: formData.type,
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "درخواست مرخصی با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", result.message || "خطا در ثبت درخواست");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const selectedType = LEAVE_TYPES.find((t) => t.key === formData.type);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>درخواست مرخصی جدید</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Preview Card */}
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons
                name={selectedType?.icon as any}
                size={24}
                color={selectedType?.color}
              />
              <Text style={styles.previewTitle}>
                {selectedType?.label || "مرخصی"}
              </Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewInfo}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>کارمند:</Text>
                <Text style={styles.previewValue}>
                  {formData.userId || "---"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>از تاریخ:</Text>
                <Text style={styles.previewValue}>
                  {formData.startDate || "---"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>تا تاریخ:</Text>
                <Text style={styles.previewValue}>
                  {formData.endDate || "---"}
                </Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>وضعیت:</Text>
                <View style={styles.previewStatus}>
                  <View style={styles.previewStatusDot} />
                  <Text style={styles.previewStatusText}>در انتظار</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>اطلاعات کارمند</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>شناسه کارمند *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="شناسه کارمند را وارد کنید"
                  placeholderTextColor="#94a3b8"
                  value={formData.userId}
                  onChangeText={(text) =>
                    setFormData({ ...formData, userId: text })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>نوع مرخصی *</Text>
            </View>

            <View style={styles.optionsGrid}>
              {LEAVE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.optionItem,
                    formData.type === type.key && styles.optionSelected,
                    {
                      borderColor:
                        formData.type === type.key ? type.color : "transparent",
                    },
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.key })}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={18}
                    color={formData.type === type.key ? type.color : "#94a3b8"}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      formData.type === type.key && styles.optionTextSelected,
                      {
                        color:
                          formData.type === type.key ? type.color : "#64748b",
                      },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>تاریخ مرخصی</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>تاریخ شروع *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={formData.startDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, startDate: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>تاریخ پایان *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={formData.endDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, endDate: text })
                  }
                />
              </View>
            </View>

            {/* Calculate Days */}
            {formData.startDate && formData.endDate && (
              <View style={styles.daysInfo}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#8b5cf6"
                />
                <Text style={styles.daysText}>
                  مدت زمان:{" "}
                  {Math.ceil(
                    (new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ) + 1}{" "}
                  روز
                </Text>
              </View>
            )}
          </View>

          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#8b5cf6"
              />
              <Text style={styles.sectionTitle}>توضیحات</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>دلیل</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="دلیل درخواست مرخصی را وارد کنید..."
                  placeholderTextColor="#94a3b8"
                  value={formData.reason}
                  onChangeText={(text) =>
                    setFormData({ ...formData, reason: text })
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.submitText}>در حال ثبت...</Text>
              </>
            ) : (
              <>
                <Ionicons name="send-outline" size={22} color="#fff" />
                <Text style={styles.submitText}>ثبت درخواست</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  backButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  previewCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  previewDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 12,
  },
  previewInfo: {
    gap: 6,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  previewValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  previewStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  previewStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
  },
  previewStatusText: {
    fontSize: 13,
    color: "#f59e0b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  formSection: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  inputWithIcon: {
    flex: 1,
    padding: 12,
    paddingLeft: 0,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textAreaWrapper: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  textArea: {
    minHeight: 100,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlignVertical: "top",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  optionSelected: {
    backgroundColor: "#ede9fe",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Vazir",
  },
  optionTextSelected: {
    fontWeight: "600",
  },
  daysInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ede9fe",
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  daysText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontWeight: "500",
    fontFamily: "Vazir",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
