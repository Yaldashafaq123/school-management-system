// app/(principal)/teachers/[id]/edit.tsx
import { principalApi } from "@/src/config/principalApi";
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

type TeacherData = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  teacherCode: string;
  isActive: boolean;
  joiningDate: string;
  specialization: string;
  experience: string;
  certification: string;
  baseSalary: number;
  availability: boolean;
};

export default function EditTeacherScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [availability, setAvailability] = useState(true);
  const [joiningDate, setJoiningDate] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [certification, setCertification] = useState("");
  const [baseSalary, setBaseSalary] = useState("");

  useEffect(() => {
    if (id) fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await principalApi.getTeacherById(Number(id));
      if (response.success) {
        const data = response.data;
        setFullName(data.User?.fullName || "");
        setEmail(data.User?.email || "");
        setPhone(data.User?.phone || "");
        setTeacherCode(data.teacherCode || "");
        setIsActive(data.isActive !== undefined ? data.isActive : true);
        setAvailability(data.availability !== undefined ? data.availability : true);
        setJoiningDate(data.joiningDate ? new Date(data.joiningDate).toISOString().split('T')[0] : "");
        setSpecialization(data.specialization || "");
        setExperience(data.experience || "");
        setCertification(data.certification || "");
        setBaseSalary(data.baseSalary ? data.baseSalary.toString() : "");
      }
    } catch (error) {
      console.error("Fetch teacher error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات استاد");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("خطا", "نام استاد الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.updateTeacher?.(Number(id), {
        fullName: fullName.trim(),
        phone: phone || undefined,
        isActive: isActive,
        availability: availability,
        specialization: specialization || undefined,
        experience: experience || undefined,
        certification: certification || undefined,
        baseSalary: baseSalary ? parseFloat(baseSalary) : undefined,
      });

      if (response?.success) {
        Alert.alert(
          "موفقیت",
          "اطلاعات استاد با موفقیت به‌روزرسانی شد",
          [{ text: "باشه", onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ویرایش اطلاعات استاد</Text>
      <Text style={styles.subtitle}>{fullName || "استاد"}</Text>

      <View style={styles.card}>
        {/* Personal Info */}
        <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
        
        <Text style={styles.label}>نام کامل *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام کامل استاد"
          placeholderTextColor="#94a3b8"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>ایمیل</Text>
        <TextInput
          style={styles.input}
          placeholder="ایمیل"
          placeholderTextColor="#94a3b8"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={false}
        />

        <Text style={styles.label}>شماره تماس</Text>
        <TextInput
          style={styles.input}
          placeholder="شماره تماس"
          placeholderTextColor="#94a3b8"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>کد استاد</Text>
        <TextInput
          style={styles.input}
          placeholder="کد استاد"
          placeholderTextColor="#94a3b8"
          value={teacherCode}
          onChangeText={setTeacherCode}
          editable={false}
        />

        {/* Professional Info */}
        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>اطلاعات حرفه‌ای</Text>

        <Text style={styles.label}>تخصص</Text>
        <TextInput
          style={styles.input}
          placeholder="تخصص"
          placeholderTextColor="#94a3b8"
          value={specialization}
          onChangeText={setSpecialization}
        />

        <Text style={styles.label}>سابقه کار</Text>
        <TextInput
          style={styles.input}
          placeholder="سابقه کار (مثال: ۵ سال)"
          placeholderTextColor="#94a3b8"
          value={experience}
          onChangeText={setExperience}
        />

        <Text style={styles.label}>مدارک</Text>
        <TextInput
          style={styles.input}
          placeholder="مدارک و گواهی‌ها"
          placeholderTextColor="#94a3b8"
          value={certification}
          onChangeText={setCertification}
        />

        <Text style={styles.label}>معاش پایه</Text>
        <TextInput
          style={styles.input}
          placeholder="معاش پایه (افغانی)"
          placeholderTextColor="#94a3b8"
          value={baseSalary}
          onChangeText={setBaseSalary}
          keyboardType="numeric"
        />

        <Text style={styles.label}>تاریخ پیوستن</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={joiningDate}
          onChangeText={setJoiningDate}
        />

        {/* Status Toggles */}
        <View style={styles.switchRow}>
          <Text style={styles.label}>فعال</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#e2e8f0", true: "#10b981" }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>در دسترس</Text>
          <Switch
            value={availability}
            onValueChange={setAvailability}
            trackColor={{ false: "#e2e8f0", true: "#3b82f6" }}
          />
        </View>

        {/* Save Button */}
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
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "VazirBold",
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
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});