// app/(principal)/classes/[id]/edit.tsx - FIXED
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

type TeacherOption = {
  id: number;
  fullName: string;
};

type AcademicYearOption = {
  id: number;
  name: string;
  isActive: boolean;
};

// ✅ Extended class type with teacherId
type ClassWithTeacher = {
  id: number;
  name: string;
  section: string;
  description: string;
  is_active: boolean;
  teacherId: number | null;
  academicYearId: number;
};

export default function EditClassScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [academicYearId, setAcademicYearId] = useState<number | null>(null);

  // Options
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);

  // ✅ Add fetchData as a separate function so it can be used in useEffect
  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, yearsRes] = await Promise.all([
        principalApi.getClasses(),
        principalApi.getTeachers({ limit: 100 }),
        principalApi.getAcademicYears(),
      ]);

      // Find the class
      if (classesRes.success) {
        const cls = classesRes.data.find((c: any) => c.id === Number(id));
        if (cls) {
          setName(cls.name || "");
          setSection(cls.section || "");
          setDescription(cls.description || "");
          setIsActive(cls.is_active !== undefined ? cls.is_active : true);
          // ✅ Use teacherName to find teacherId, or set to null
          setTeacherId(cls.teacherId || null);
          setAcademicYearId(cls.academicYearId || null);
        }
      }

      if (teachersRes.success) {
        setTeachers(
          teachersRes.data.teachers.map((t: any) => ({
            id: t.id,
            fullName: t.fullName,
          })),
        );
      }

      if (yearsRes.success) {
        setAcademicYears(yearsRes.data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات صنف");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add fetchData to dependency array
  useEffect(() => {
    if (id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("خطا", "نام صنف الزامی است");
      return;
    }
    if (!academicYearId) {
      Alert.alert("خطا", "سال تعلیمی الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.updateClass(Number(id), {
        name: name.trim(),
        section: section.trim() || undefined,
        description: description.trim() || undefined,
        is_active: isActive,
        teacherId: teacherId || null,
        academicYearId: academicYearId,
      });

      if (response.success) {
        Alert.alert("موفقیت", "اطلاعات صنف با موفقیت به‌روزرسانی شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی اطلاعات صنف");
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

      <Text style={styles.title}>ویرایش صنف</Text>
      <Text style={styles.subtitle}>{name || "صنف"}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>نام صنف *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام صنف"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>بخش</Text>
        <TextInput
          style={styles.input}
          placeholder="بخش (مثال: الف)"
          placeholderTextColor="#94a3b8"
          value={section}
          onChangeText={setSection}
        />

        <Text style={styles.label}>سال تعلیمی *</Text>
        <View style={styles.optionsGrid}>
          {academicYears.map((year) => (
            <TouchableOpacity
              key={year.id}
              style={[
                styles.optionItem,
                academicYearId === year.id && styles.optionSelected,
                year.isActive && styles.optionActive,
              ]}
              onPress={() => setAcademicYearId(year.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  academicYearId === year.id && styles.optionTextSelected,
                ]}
              >
                {year.name}
                {year.isActive && " ✓"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>استاد صنف</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity
            style={[
              styles.optionItem,
              teacherId === null && styles.optionSelected,
            ]}
            onPress={() => setTeacherId(null)}
          >
            <Text
              style={[
                styles.optionText,
                teacherId === null && styles.optionTextSelected,
              ]}
            >
              بدون استاد
            </Text>
          </TouchableOpacity>
          {teachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={[
                styles.optionItem,
                teacherId === teacher.id && styles.optionSelected,
              ]}
              onPress={() => setTeacherId(teacher.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  teacherId === teacher.id && styles.optionTextSelected,
                ]}
              >
                {teacher.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>توضیحات</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="توضیحات اضافی..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>فعال</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#e2e8f0", true: "#10b981" }}
          />
        </View>

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
  textArea: {
    minHeight: 80,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  optionActive: {
    borderColor: "#10b981",
  },
  optionText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  optionTextSelected: {
    color: "#f59e0b",
    fontWeight: "600",
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
