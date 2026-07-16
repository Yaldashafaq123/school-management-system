// app/(principal)/profile/edit.tsx
import { useAuth } from "@/contexts/AuthContext";
import { principalApi } from "@/src/config/principalApi";
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

export default function EditPrincipalProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [experience, setExperience] = useState("");
  const [qualification, setQualification] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await principalApi.getProfile();
      if (response.success) {
        setProfile(response.data);
        setFullName(response.data.user.fullName || "");
        setPhone(response.data.user.phone || "");
        setPosition(response.data.principalStaff.position || "");
        setExperience(response.data.principalStaff.experience || "");
        setQualification(response.data.principalStaff.qualification || "");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("خطا", "نام کامل الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone || undefined,
        position: position || undefined,
        experience: experience || undefined,
        qualification: qualification || undefined,
      });

      if (response.success) {
        // Update user in context
        if (user) {
          await updateProfile({
            fullName: fullName.trim(),
            phone: phone || undefined,
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
        <ActivityIndicator size="large" color="#f59e0b" />
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
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>ایمیل</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={profile?.user.email || user?.email || ""}
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

        <Text style={styles.label}>سمت</Text>
        <TextInput
          style={styles.input}
          placeholder="سمت"
          placeholderTextColor="#94a3b8"
          value={position}
          onChangeText={setPosition}
        />

        <Text style={styles.label}>سابقه کار</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="سابقه کار (مثال: ۱۰ سال در حوزه آموزش)"
          placeholderTextColor="#94a3b8"
          value={experience}
          onChangeText={setExperience}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />

        <Text style={styles.label}>مدارک تحصیلی</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="مدارک تحصیلی و گواهی‌ها"
          placeholderTextColor="#94a3b8"
          value={qualification}
          onChangeText={setQualification}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
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
  disabledInput: {
    opacity: 0.7,
  },
  textArea: {
    minHeight: 60,
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
