// app/(hr)/staff/[id]/edit.tsx
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditStaffScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    isActive: true,
    position: "",
    department: "",
    salary: "",
    specialization: "",
    experience: "",
    qualification: "",
  });

  useEffect(() => {
    if (id) fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      const response = await hrApi.getStaffById(Number(id));
      if (response.success) {
        const data = response.data;
        setFormData({
          fullName: data.fullName || "",
          phone: data.phone || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
          position:
            data.Teacher?.specialization ||
            data.FinanceStaff?.position ||
            data.PrincipalStaff?.position ||
            data.HRStaff?.position ||
            "",
          department:
            data.FinanceStaff?.department || data.HRStaff?.department || "",
          salary:
            data.Teacher?.baseSalary?.toString() ||
            data.FinanceStaff?.salary?.toString() ||
            data.HRStaff?.salary?.toString() ||
            "",
          specialization: data.Teacher?.specialization || "",
          experience:
            data.Teacher?.experience || data.PrincipalStaff?.experience || "",
          qualification: data.PrincipalStaff?.qualification || "",
        });
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات کارمند");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("خطا", "نام کامل الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await hrApi.updateStaff(Number(id), {
        fullName: formData.fullName.trim(),
        phone: formData.phone || undefined,
        isActive: formData.isActive,
        position: formData.position || undefined,
        department: formData.department || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        specialization: formData.specialization || undefined,
        experience: formData.experience || undefined,
        qualification: formData.qualification || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "اطلاعات کارمند به‌روزرسانی شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی");
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

      <Text style={styles.title}>ویرایش کارمند</Text>

      <View style={styles.card}>
        <Text style={styles.label}>نام کامل *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام کامل"
          placeholderTextColor="#94a3b8"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
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

        <View style={styles.switchRow}>
          <Text style={styles.label}>فعال</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) =>
              setFormData({ ...formData, isActive: value })
            }
            trackColor={{ false: "#e2e8f0", true: "#10b981" }}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>ذخیره تغییرات</Text>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
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
