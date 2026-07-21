// app/(hr)/profile/edit.tsx
import { useAuth } from "@/contexts/AuthContext";
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await hrApi.getProfile();
      if (response.success) {
        const data = response.data;
        const newData = {
          fullName: data.user.fullName || "",
          phone: data.user.phone || "",
          position: data.hrStaff.position || "",
          department: data.hrStaff.department || "",
          salary: data.hrStaff.salary?.toString() || "",
        };
        setFormData(newData);
        setOriginalData(newData);
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

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    icon: string,
    keyboardType: "default" | "numeric" | "phone-pad" = "default",
    editable: boolean = true,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, !editable && styles.disabledInput]}>
        <Ionicons
          name={icon as any}
          size={20}
          color="#94a3b8"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.inputWithIcon, !editable && styles.disabledText]}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={formData[field]}
          onChangeText={(text) => setFormData({ ...formData, [field]: text })}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>ویرایش پروفایل</Text>
        <TouchableOpacity
          style={[
            styles.saveHeaderButton,
            !hasChanges() && styles.saveHeaderDisabled,
          ]}
          onPress={handleSave}
          disabled={submitting || !hasChanges()}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveHeaderText}>ذخیره</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {formData.fullName?.charAt(0) ||
                  user?.fullName?.charAt(0) ||
                  "?"}
              </Text>
            </View>
            <TouchableOpacity style={styles.avatarEditButton}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Personal Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
            </View>

            {renderInput(
              "نام کامل *",
              "fullName",
              "نام کامل را وارد کنید",
              "person-outline",
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>ایمیل</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#94a3b8"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.inputWithIcon, styles.disabledText]}
                  value={user?.email || ""}
                  editable={false}
                />
              </View>
            </View>

            {renderInput(
              "شماره تماس",
              "phone",
              "شماره تماس را وارد کنید",
              "call-outline",
              "phone-pad",
            )}
          </View>

          {/* Work Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>اطلاعات شغلی</Text>
            </View>

            {renderInput(
              "سمت",
              "position",
              "سمت خود را وارد کنید",
              "business-outline",
            )}
            {renderInput(
              "بخش",
              "department",
              "بخش خود را وارد کنید",
              "grid-outline",
            )}
            {renderInput(
              "معاش",
              "salary",
              "معاش خود را وارد کنید (افغانی)",
              "cash-outline",
              "numeric",
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              submitting && styles.saveDisabled,
              !hasChanges() && styles.saveDisabled,
            ]}
            onPress={handleSave}
            disabled={submitting || !hasChanges()}
          >
            {submitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveText}>در حال ذخیره...</Text>
              </>
            ) : (
              <>
                <Ionicons name="save-outline" size={22} color="#fff" />
                <Text style={styles.saveText}>ذخیره تغییرات</Text>
              </>
            )}
          </TouchableOpacity>

          {!hasChanges() && !submitting && (
            <Text style={styles.noChangesText}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color="#94a3b8"
              />{" "}
              هیچ تغییری اعمال نشده است
            </Text>
          )}
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
  saveHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  saveHeaderDisabled: {
    opacity: 0.5,
  },
  saveHeaderText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: "#8b5cf6",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
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
  disabledInput: {
    backgroundColor: "#f1f5f9",
    opacity: 0.8,
  },
  disabledText: {
    color: "#94a3b8",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  noChangesText: {
    textAlign: "center",
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 12,
    fontFamily: "Vazir",
  },
});
