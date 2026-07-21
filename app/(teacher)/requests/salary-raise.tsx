// app/(teacher)/requests/salary-raise.tsx - Connected to Backend
import { teacherApi } from "@/src/config/teacherApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

export default function RequestSalaryRaiseScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentSalary: "",
    requestedAmount: "",
    reason: "",
    achievements: "",
  });

  const handleSubmit = async () => {
    if (!formData.requestedAmount || !formData.reason) {
      Alert.alert("خطا", "لطفاً مبلغ درخواستی و دلیل را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await teacherApi.requestSalaryRaise({
        currentSalary: formData.currentSalary || undefined,
        requestedAmount: formData.requestedAmount,
        reason: formData.reason,
        achievements: formData.achievements || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "درخواست افزایش معاش با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت درخواست");
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
        <Text style={styles.headerTitle}>درخواست افزایش معاش</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <Text style={styles.label}>معاش فعلی</Text>
          <TextInput
            style={styles.input}
            placeholder="معاش فعلی (افغانی)"
            placeholderTextColor="#94a3b8"
            value={formData.currentSalary}
            onChangeText={(text) =>
              setFormData({ ...formData, currentSalary: text })
            }
            keyboardType="numeric"
          />

          <Text style={styles.label}>مبلغ درخواستی *</Text>
          <TextInput
            style={styles.input}
            placeholder="مبلغ درخواستی (افغانی)"
            placeholderTextColor="#94a3b8"
            value={formData.requestedAmount}
            onChangeText={(text) =>
              setFormData({ ...formData, requestedAmount: text })
            }
            keyboardType="numeric"
          />

          <Text style={styles.label}>دلیل درخواست *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="دلیل درخواست افزایش معاش..."
            placeholderTextColor="#94a3b8"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.label}>دستاوردها و موفقیت‌ها</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="دستاوردهای اخیر خود را ذکر کنید..."
            placeholderTextColor="#94a3b8"
            value={formData.achievements}
            onChangeText={(text) =>
              setFormData({ ...formData, achievements: text })
            }
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>
              این درخواست به مدیریت ارسال می‌شود و پس از بررسی، نتیجه به شما
              اعلام می‌گردد.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>ثبت درخواست</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>نکات مهم</Text>
          <View style={styles.infoCardItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.infoCardText}>
              درخواست شما توسط HR و مدیریت بررسی می‌شود
            </Text>
          </View>
          <View style={styles.infoCardItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.infoCardText}>
              پاسخ درخواست حداکثر ۷ روز کاری اعلام می‌شود
            </Text>
          </View>
          <View style={styles.infoCardItem}>
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
            <Text style={styles.infoCardText}>
              برای افزایش معاش، عملکرد و سابقه کاری شما بررسی می‌شود
            </Text>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  textArea: { minHeight: 80 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: "#64748b" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  infoCardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  infoCardText: { fontSize: 14, color: "#64748b", flex: 1 },
});
