// app/(hr)/profile/edit.tsx
import { useAuth } from "@/contexts/AuthContext";
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function EditHRProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    position: "",
    department: "",
    salary: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await hrApi.getProfile();
      if (response.success) {
        const data = response.data;
        setFormData({
          fullName: data.user.fullName || "",
          phone: data.user.phone || "",
          position: data.hrStaff.position || "",
          department: data.hrStaff.department || "",
          salary: data.hrStaff.salary?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("خطا", "نام کامل الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await hrApi.updateProfile({
        fullName: formData.fullName.trim(),
        phone: formData.phone || undefined,
        position: formData.position || undefined,
        department: formData.department || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
      });

      if (response.success) {
        // Update user in context
        if (user) {
          await updateProfile({
            fullName: formData.fullName.trim(),
            phone: formData.phone || undefined,
          });
        }

        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ویرایش پروفایل</Text>

      <View style={styles.card}>
        <Text style={styles.label}>نام کامل *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام کامل"
          placeholderTextColor="#94a3b8"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />

        <Text style={styles.label}>ایمیل</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user?.email || ""}
          editable={false}
        />

        <Text style={styles.label}>شماره تماس</Text>
        <TextInput
          style={styles.input}
          placeholder="شماره تماس"
          placeholderTextColor="#94a3b8"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>سمت</Text>
        <TextInput
          style={styles.input}
          placeholder="سمت"
          placeholderTextColor="#94a3b8"
          value={formData.position}
          onChangeText={(text) => setFormData({ ...formData, position: text })}
        />

        <Text style={styles.label}>بخش</Text>
        <TextInput
          style={styles.input}
          placeholder="بخش"
          placeholderTextColor="#94a3b8"
          value={formData.department}
          onChangeText={(text) =>
            setFormData({ ...formData, department: text })
          }
        />

        <Text style={styles.label}>معاش</Text>
        <TextInput
          style={styles.input}
          placeholder="معاش (افغانی)"
          placeholderTextColor="#94a3b8"
          value={formData.salary}
          onChangeText={(text) => setFormData({ ...formData, salary: text })}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveDisabled]}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveText}>ذخیره تغییرات</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
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
  disabledInput: { opacity: 0.7 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
