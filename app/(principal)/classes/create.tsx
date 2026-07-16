// app/(principal)/classes/create.tsx
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

type TeacherOption = {
  id: number;
  fullName: string;
};

type AcademicYearOption = {
  id: number;
  name: string;
  isActive: boolean;
};

export default function CreateClassScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [section, setSection] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearOption[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teachersRes, yearsRes] = await Promise.all([
        principalApi.getTeachers({ limit: 100 }),
        principalApi.getAcademicYears?.() ||
          Promise.resolve({ success: true, data: [] }),
      ]);

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
        // Auto-select active academic year
        const activeYear = yearsRes.data.find((y: any) => y.isActive);
        if (activeYear) setSelectedYear(activeYear.id);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("خطا", "نام صنف الزامی است");
      return;
    }
    if (!selectedYear) {
      Alert.alert("خطا", "سال تعلیمی الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.createClass({
        name: name.trim(),
        section: section.trim() || undefined,
        academicYearId: selectedYear,
        teacherId: selectedTeacher || undefined,
        description: description.trim() || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "صنف با موفقیت ایجاد شد", [
          {
            text: "باشه",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ایجاد صنف");
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

      <Text style={styles.title}>ایجاد صنف جدید</Text>

      <View style={styles.card}>
        <Text style={styles.label}>نام صنف *</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: صنف ۱۰"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>بخش</Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: الف"
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
                selectedYear === year.id && styles.optionSelected,
                year.isActive && styles.optionActive,
              ]}
              onPress={() => setSelectedYear(year.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedYear === year.id && styles.optionTextSelected,
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
          {teachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={[
                styles.optionItem,
                selectedTeacher === teacher.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedTeacher(teacher.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedTeacher === teacher.id && styles.optionTextSelected,
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

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text style={styles.submitText}>ایجاد صنف</Text>
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
    marginTop: 16,
    marginBottom: 8,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
