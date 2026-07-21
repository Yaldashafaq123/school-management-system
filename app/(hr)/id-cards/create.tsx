// app/(hr)/id-cards/create.tsx
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

export default function CreateIdCardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    expiryDate: "",
  });

  const handleSubmit = async () => {
    if (!formData.userId) {
      Alert.alert("خطا", "شناسه کارمند الزامی است");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/id-cards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            userId: parseInt(formData.userId),
            expiryDate: formData.expiryDate || undefined,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "کارت شناسایی با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", result.message || "خطا در ایجاد کارت");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ایجاد کارت");
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

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
        <Text style={styles.headerTitle}>ایجاد کارت شناسایی</Text>
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
              <Ionicons name="card" size={32} color="#8b5cf6" />
              <Text style={styles.previewTitle}>کارت شناسایی</Text>
            </View>
            <View style={styles.previewDivider} />
            <View style={styles.previewInfo}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>شماره کارت:</Text>
                <Text style={styles.previewValue}>---</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>وضعیت:</Text>
                <View style={styles.previewStatus}>
                  <View style={styles.previewStatusDot} />
                  <Text style={styles.previewStatusText}>در انتظار</Text>
                </View>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>تاریخ انقضا:</Text>
                <Text style={styles.previewValue}>
                  {formData.expiryDate || "۱ سال بعد"}
                </Text>
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
                  placeholder="YYYY-MM-DD (پیش‌فرض: ۱ سال)"
                  placeholderTextColor="#94a3b8"
                  value={formData.expiryDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, expiryDate: text })
                  }
                />
              </View>
              <Text style={styles.hintText}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#94a3b8"
                />{" "}
                اگر خالی بگذارید، تاریخ انقضا ۱ سال بعد محاسبه می‌شود
              </Text>
            </View>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#8b5cf6"
            />

            <Text style={styles.infoText}>
              کارت با شماره منحصر به فرد ایجاد می‌شود. پس از چاپ، وضعیت کارت به
              <Text style={styles.infoHighlight}> فعال&#34; </Text>
              تغییر می‌کند.
            </Text>
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
                <Text style={styles.submitText}>در حال ایجاد...</Text>
              </>
            ) : (
              <>
                <Ionicons name="card-outline" size={22} color="#fff" />
                <Text style={styles.submitText}>ایجاد کارت</Text>
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
    gap: 8,
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  hintText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 6,
    fontFamily: "Vazir",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#ede9fe",
    borderRadius: 10,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    lineHeight: 20,
  },
  infoHighlight: {
    fontWeight: "600",
    color: "#8b5cf6",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
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
