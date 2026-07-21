// app/(hr)/warnings/create.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const WARNING_TYPES = [
  { key: "VERBAL", label: "شفاهی" },
  { key: "WRITTEN", label: "کتبی" },
  { key: "FINAL", label: "نهایی" },
  { key: "TERMINATION", label: "اخراج" },
];

export default function CreateWarningScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    type: "VERBAL",
    title: "",
    description: "",
  });

  const handleSubmit = async () => {
    if (!formData.userId || !formData.title || !formData.description) {
      Alert.alert("خطا", "شناسه کارمند، عنوان و توضیحات الزامی است");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/warnings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            userId: parseInt(formData.userId),
            type: formData.type,
            title: formData.title,
            description: formData.description,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "اخطار با موفقیت صادر شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در صدور اخطار");
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>صدور اخطار جدید</Text>

      <View style={styles.card}>
        <Text style={styles.label}>شناسه کارمند *</Text>
        <TextInput
          style={styles.input}
          placeholder="شناسه کارمند را وارد کنید"
          placeholderTextColor="#94a3b8"
          value={formData.userId}
          onChangeText={(text) => setFormData({ ...formData, userId: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>نوع اخطار *</Text>
        <View style={styles.optionsGrid}>
          {WARNING_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionItem,
                formData.type === type.key && styles.optionSelected,
              ]}
              onPress={() => setFormData({ ...formData, type: type.key })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.type === type.key && styles.optionTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>عنوان اخطار *</Text>
        <TextInput
          style={styles.input}
          placeholder="عنوان اخطار"
          placeholderTextColor="#94a3b8"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <Text style={styles.label}>توضیحات *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="توضیحات کامل اخطار..."
          placeholderTextColor="#94a3b8"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <View style={styles.infoBox}>
          <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
          <Text style={styles.infoText}>
            اخطار برای کارمند ثبت می‌شود. پس از حل مشکل، می‌توانید اخطار را
            ببندید.
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
              <Ionicons name="alert-circle-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>صدور اخطار</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
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
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  textArea: { minHeight: 100 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: { backgroundColor: "#fce4ec", borderColor: "#ef4444" },
  optionText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  optionTextSelected: { color: "#ef4444", fontWeight: "600" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#fce4ec",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
