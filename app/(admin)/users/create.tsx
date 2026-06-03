// app/(admin)/users/create.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  adminUserApi,
  ClassOption,
  TeacherOption,
  UserRole,
} from "@/src/config/adminUserApi";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateUserScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childEmail, setChildEmail] = useState("");
  const [searchingChild, setSearchingChild] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as UserRole,
    classId: null as number | null,
    teacherId: null as number | null,
    childId: null as number | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset class-related fields when role changes
    if (formData.role === "student") {
      setFormData((prev) => ({ ...prev, teacherId: null, childId: null }));
    } else if (formData.role === "teacher") {
      setFormData((prev) => ({ ...prev, classId: null, childId: null }));
    } else if (formData.role === "parent") {
      setFormData((prev) => ({ ...prev, classId: null, teacherId: null }));
    }
  }, [formData.role]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [classesRes, teachersRes] = await Promise.all([
        adminUserApi.getClasses(),
        adminUserApi.getTeachers(),
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
      }
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const searchStudentByEmail = async () => {
    if (!childEmail.trim()) {
      Alert.alert("خطا", "لطفاً ایمیل دانش‌آموز را وارد کنید");
      return;
    }

    setSearchingChild(true);
    try {
      const response = await adminUserApi.findStudentByEmail(childEmail);
      if (response.success && response.data) {
        Alert.alert(
          "دانش‌آموز یافت شد",
          `دانش‌آموز: ${response.data.name}\nایمیل: ${response.data.email}\nصنف: ${response.data.className || "نامشخص"}`,
          [
            { text: "لغو", style: "cancel" },
            {
              text: "انتخاب",
              onPress: () => {
                setFormData((prev) => ({
                  ...prev,
                  childId: response.data?.id || null,
                }));
                setSelectedChildId(response.data?.id || null);
                setChildEmail("");
              },
            },
          ],
        );
      } else {
        Alert.alert("خطا", "دانش‌آموزی با این ایمیل یافت نشد");
      }
    } catch (err) {
      Alert.alert("خطا", "مشکل در جستجوی دانش‌آموز");
    } finally {
      setSearchingChild(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName)
      newErrors.fullName = "نام و نام خانوادگی الزامی است";
    if (!formData.email) newErrors.email = "ایمیل الزامی است";
    if (!formData.password) newErrors.password = "رمز عبور الزامی است";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";

    if (formData.role === "student" && !formData.classId)
      newErrors.classId = "انتخاب صنف الزامی است";
    if (formData.role === "teacher" && !formData.teacherId)
      newErrors.teacherId = "انتخاب صنف (به عنوان سرپرست) الزامی است";
    if (formData.role === "parent" && !formData.childId)
      newErrors.childId = "انتخاب دانش‌آموز الزامی است";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await adminUserApi.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        classId: formData.classId,
        teacherId: formData.teacherId,
        childId: formData.childId,
      });

      if (response.success) {
        Alert.alert("موفقیت", response.message, [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (err) {
      Alert.alert("خطا", "مشکل در ایجاد کاربر");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ایجاد کاربر جدید" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات پایه</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام و نام خانوادگی *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="مثال: علی احمدی"
              textAlign="right"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ایمیل *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@school.com"
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>شماره تلفن</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="۰۷۸۱۲۳۴۵۶۷"
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رمز عبور *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="حداقل ۶ کاراکتر"
                secureTextEntry={!showPassword}
                textAlign="right"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>
        </View>

        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نقش کاربری</Text>
          <View style={styles.roleContainer}>
            {(["student", "teacher", "parent", "admin"] as UserRole[]).map(
              (role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === role && styles.roleTextActive,
                    ]}
                  >
                    {role === "student"
                      ? "دانش‌آموز"
                      : role === "teacher"
                        ? "معلم"
                        : role === "parent"
                          ? "والدین"
                          : "مدیر"}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Student Fields */}
        {formData.role === "student" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات دانش‌آموز</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صنف *</Text>
              <View style={styles.selectContainer}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.selectOption,
                      formData.classId === cls.id && styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, classId: cls.id })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.classId === cls.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {cls.displayName}
                    </Text>
                    {formData.classId === cls.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.classId && (
                <Text style={styles.errorText}>{errors.classId}</Text>
              )}
            </View>
          </View>
        )}

        {/* Teacher Fields - Supervisor Assignment */}
        {formData.role === "teacher" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات معلم</Text>
            <Text style={styles.sectionSubtitle}>
              معلم به عنوان سرپرست صنف تعیین می‌شود
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صنف (به عنوان سرپرست) *</Text>
              <View style={styles.selectContainer}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.selectOption,
                      formData.teacherId === cls.id &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, teacherId: cls.id })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.teacherId === cls.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {cls.displayName}
                    </Text>
                    {formData.teacherId === cls.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.teacherId && (
                <Text style={styles.errorText}>{errors.teacherId}</Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors.info}
              />
              <Text style={styles.infoText}>
                معلم به عنوان سرپرست صنف تعیین می‌شود. می‌تواند دروس آن صنف را
                مدیریت کند و حضور و غیاب ثبت نماید.
              </Text>
            </View>
          </View>
        )}

        {/* Parent Fields */}
        {formData.role === "parent" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات والدین</Text>
            <Text style={styles.sectionSubtitle}>
              دانش‌آموز خود را انتخاب کنید
            </Text>

            {selectedChildId ? (
              <View style={styles.selectedChildContainer}>
                <Text style={styles.selectedChildText}>
                  دانش‌آموز انتخاب شده: {formData.childId}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedChildId(null);
                    setFormData({ ...formData, childId: null });
                  }}
                >
                  <Text style={styles.changeChildText}>تغییر</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={childEmail}
                  onChangeText={setChildEmail}
                  placeholder="ایمیل دانش‌آموز را وارد کنید"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={searchStudentByEmail}
                  disabled={searchingChild}
                >
                  <Text style={styles.searchButtonText}>
                    {searchingChild ? "جستجو..." : "جستجو"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {errors.childId && (
              <Text style={styles.errorText}>{errors.childId}</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreateUser}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "در حال ایجاد..." : "ایجاد کاربر"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  roleTextActive: {
    color: "#fff",
  },
  selectContainer: {
    gap: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 45,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  selectedChildContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChildText: {
    fontSize: 14,
    color: Colors.text,
  },
  changeChildText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
