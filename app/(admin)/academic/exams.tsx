// app/(admin)/announcements/create-exam.tsx
import { Header } from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
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

export default function CreateExamAnnouncement() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    eventDate: new Date(),
    eventLocation: "",
    priority: "HIGH",
    targetClasses: [] as number[],
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      Alert.alert("خطا", "عنوان و متن اعلامیه الزامی است");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        "https://asraschools.cloud/api/announcements/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content,
            type: "EXAM",
            priority: formData.priority,
            targetType: "ALL", // or 'SPECIFIC_CLASS'
            targetClasses: formData.targetClasses,
            eventDate: formData.eventDate.toISOString(),
            eventLocation: formData.eventLocation,
            requireConfirmation: false,
            allowComments: true,
          }),
        },
      );

      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "اعلامیه امتحان با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", result.message);
      }
    } catch (error) {
      Alert.alert("خطا", "مشکلی در ایجاد اعلامیه پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="ایجاد اعلامیه امتحان" showBack />

      <ScrollView style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>عنوان امتحان *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: امتحان ریاضی نیم سال اول"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>توضیحات *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="توضیحات کامل امتحان..."
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>تاریخ برگزاری</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formData.eventDate.toLocaleDateString("fa-IR")}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.eventDate}
              mode="date"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setFormData({ ...formData, eventDate: date });
              }}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>مکان برگزاری</Text>
          <TextInput
            style={styles.input}
            placeholder="سالن، کلاس، آزمایشگاه..."
            value={formData.eventLocation}
            onChangeText={(text) =>
              setFormData({ ...formData, eventLocation: text })
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>اولویت</Text>
          <View style={styles.priorityContainer}>
            {["LOW", "NORMAL", "HIGH", "URGENT"].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  formData.priority === priority && styles.priorityButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text
                  style={[
                    styles.priorityText,
                    formData.priority === priority && styles.priorityTextActive,
                  ]}
                >
                  {priority === "LOW"
                    ? "عادی"
                    : priority === "NORMAL"
                      ? "متوسط"
                      : priority === "HIGH"
                        ? "مهم"
                        : "فوری"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>ایجاد اعلامیه امتحان</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 16 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 8, color: "#333" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: { minHeight: 120, textAlignVertical: "top" },
  dateButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
  },
  priorityContainer: { flexDirection: "row", gap: 12 },
  priorityButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  priorityButtonActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  priorityText: { color: "#333" },
  priorityTextActive: { color: "#fff" },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
