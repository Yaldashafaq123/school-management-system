// app/(hr)/documents/upload.tsx
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DOCUMENT_TYPES = [
  {
    key: "CONTRACT",
    label: "قرارداد",
    icon: "document-text-outline",
    color: "#3b82f6",
  },
  {
    key: "CERTIFICATE",
    label: "مدرک تحصیلی",
    icon: "school-outline",
    color: "#10b981",
  },
  {
    key: "RECOMMENDATION",
    label: "توصیه‌نامه",
    icon: "mail-outline",
    color: "#f59e0b",
  },
  {
    key: "WARNING",
    label: "اخطار",
    icon: "alert-circle-outline",
    color: "#ef4444",
  },
  {
    key: "POLICY",
    label: "سیاست‌نامه",
    icon: "document-outline",
    color: "#8b5cf6",
  },
  { key: "OTHER", label: "سایر", icon: "folder-outline", color: "#94a3b8" },
];

export default function UploadDocumentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    title: "",
    description: "",
    type: "OTHER",
    fileUrl: "",
    isConfidential: false,
    expiresAt: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.fileUrl || !formData.type) {
      Alert.alert("خطا", "عنوان، آدرس فایل و نوع سند الزامی است");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/documents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            userId: formData.userId ? parseInt(formData.userId) : null,
            title: formData.title,
            description: formData.description,
            type: formData.type,
            fileUrl: formData.fileUrl,
            isConfidential: formData.isConfidential,
            expiresAt: formData.expiresAt || undefined,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "سند با موفقیت آپلود شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", result.message || "خطا در آپلود سند");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در آپلود سند");
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const selectedType = DOCUMENT_TYPES.find((t) => t.key === formData.type);

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
        <Text style={styles.headerTitle}>آپلود سند جدید</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#8b5cf6"
              />
              <Text style={styles.sectionTitle}>اطلاعات پایه</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>شناسه کارمند</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="شناسه کارمند (اختیاری)"
                  placeholderTextColor="#94a3b8"
                  value={formData.userId}
                  onChangeText={(text) =>
                    setFormData({ ...formData, userId: text })
                  }
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>عنوان سند *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="عنوان سند را وارد کنید"
                  placeholderTextColor="#94a3b8"
                  value={formData.title}
                  onChangeText={(text) =>
                    setFormData({ ...formData, title: text })
                  }
                />
              </View>
            </View>
          </View>

          {/* Document Type Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="folder-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>نوع سند *</Text>
            </View>

            <View style={styles.optionsGrid}>
              {DOCUMENT_TYPES.map((type) => (
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
                    size={20}
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

            {selectedType && (
              <View style={styles.selectedTypeIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={selectedType.color}
                />
                <Text
                  style={[
                    styles.selectedTypeText,
                    { color: selectedType.color },
                  ]}
                >
                  نوع انتخاب شده: {selectedType.label}
                </Text>
              </View>
            )}
          </View>

          {/* File Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="cloud-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>اطلاعات فایل</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>آدرس فایل *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="link-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="https://example.com/document.pdf"
                  placeholderTextColor="#94a3b8"
                  value={formData.fileUrl}
                  onChangeText={(text) =>
                    setFormData({ ...formData, fileUrl: text })
                  }
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>توضیحات</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="توضیحات سند را وارد کنید..."
                  placeholderTextColor="#94a3b8"
                  value={formData.description}
                  onChangeText={(text) =>
                    setFormData({ ...formData, description: text })
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>

          {/* Advanced Options */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="options-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>تنظیمات پیشرفته</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>تاریخ انقضا</Text>
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
                  value={formData.expiresAt}
                  onChangeText={(text) =>
                    setFormData({ ...formData, expiresAt: text })
                  }
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#8b5cf6"
                />
                <Text style={styles.switchLabel}>محرمانه</Text>
              </View>
              <Switch
                value={formData.isConfidential}
                onValueChange={(value) =>
                  setFormData({ ...formData, isConfidential: value })
                }
                trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                thumbColor={formData.isConfidential ? "#fff" : "#fff"}
                ios_backgroundColor="#e2e8f0"
              />
            </View>

            {formData.isConfidential && (
              <View style={styles.confidentialNote}>
                <Ionicons name="information-circle" size={16} color="#f59e0b" />
                <Text style={styles.confidentialNoteText}>
                  سند محرمانه فقط برای کاربران مجاز قابل مشاهده خواهد بود
                </Text>
              </View>
            )}
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
                <Text style={styles.submitText}>در حال آپلود...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={22} color="#fff" />
                <Text style={styles.submitText}>آپلود سند</Text>
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
  sectionContainer: {
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
  selectedTypeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  selectedTypeText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Vazir",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  switchLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  confidentialNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
  },
  confidentialNoteText: {
    flex: 1,
    fontSize: 12,
    color: "#92400e",
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
