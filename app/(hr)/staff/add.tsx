// app/(hr)/staff/add.tsx
import { hrApi } from "@/src/config/hrApi";
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

const ROLES = [
  { value: "TEACHER", label: "استاد" },
  { value: "FINANCE", label: "مالی" },
  { value: "HR", label: "منابع بشری" },
  { value: "PRINCIPAL", label: "مدیر مکتب" },
];

export default function AddStaffScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "TEACHER",
    position: "",
    department: "",
    salary: "",
    joinDate: "",
    specialization: "",
    experience: "",
    qualification: "",
    teacherCode: "",
  });

  const handleSubmit = async () => {
    // Validate
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      Alert.alert("خطا", "لطفاً نام، ایمیل و رمز عبور را وارد کنید");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("خطا", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      const response = await hrApi.createStaff({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone || undefined,
        password: formData.password,
        role: formData.role,
        position: formData.position || undefined,
        department: formData.department || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        joinDate: formData.joinDate || undefined,
        specialization: formData.specialization || undefined,
        experience: formData.experience || undefined,
        qualification: formData.qualification || undefined,
        teacherCode: formData.teacherCode || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "کارمند با موفقیت اضافه شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در اضافه کردن کارمند");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ثبت کارمند جدید</Text>

      <View style={styles.card}>
        <Text style={styles.label}>نام کامل *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام کامل"
          placeholderTextColor="#94a3b8"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />

        <Text style={styles.label}>ایمیل *</Text>
        <TextInput
          style={styles.input}
          placeholder="ایمیل"
          placeholderTextColor="#94a3b8"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
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

        <Text style={styles.label}>رمز عبور *</Text>
        <TextInput
          style={styles.input}
          placeholder="حداقل ۶ کاراکتر"
          placeholderTextColor="#94a3b8"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <Text style={styles.label}>نقش *</Text>
        <View style={styles.optionsGrid}>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.optionItem,
                formData.role === role.value && styles.optionSelected,
              ]}
              onPress={() => setFormData({ ...formData, role: role.value })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.role === role.value && styles.optionTextSelected,
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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

        <Text style={styles.label}>تاریخ پیوستن</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={formData.joinDate}
          onChangeText={(text) => setFormData({ ...formData, joinDate: text })}
        />

        {/* Teacher specific fields */}
        {formData.role === "TEACHER" && (
          <>
            <Text style={styles.label}>تخصص</Text>
            <TextInput
              style={styles.input}
              placeholder="تخصص"
              placeholderTextColor="#94a3b8"
              value={formData.specialization}
              onChangeText={(text) =>
                setFormData({ ...formData, specialization: text })
              }
            />

            <Text style={styles.label}>سابقه کار</Text>
            <TextInput
              style={styles.input}
              placeholder="سابقه کار"
              placeholderTextColor="#94a3b8"
              value={formData.experience}
              onChangeText={(text) =>
                setFormData({ ...formData, experience: text })
              }
            />

            <Text style={styles.label}>کد استاد</Text>
            <TextInput
              style={styles.input}
              placeholder="کد استاد"
              placeholderTextColor="#94a3b8"
              value={formData.teacherCode}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherCode: text })
              }
            />
          </>
        )}

        {/* Principal specific fields */}
        {formData.role === "PRINCIPAL" && (
          <>
            <Text style={styles.label}>مدرک تحصیلی</Text>
            <TextInput
              style={styles.input}
              placeholder="مدرک تحصیلی"
              placeholderTextColor="#94a3b8"
              value={formData.qualification}
              onChangeText={(text) =>
                setFormData({ ...formData, qualification: text })
              }
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>ثبت کارمند</Text>
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
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: { backgroundColor: "#ede9fe", borderColor: "#8b5cf6" },
  optionText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  optionTextSelected: { color: "#8b5cf6", fontWeight: "600" },
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
