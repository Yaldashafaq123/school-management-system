// app/(principal)/students/[id]/promote.tsx
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type ClassOption = {
  id: number;
  name: string;
  section: string;
};

type AcademicYear = {
  id: number;
  name: string;
  isActive: boolean;
};

export default function PromoteStudentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [studentName, setStudentName] = useState("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, yearsRes, studentRes] = await Promise.all([
        principalApi.getClasses(),
        principalApi.getAcademicYears?.() ||
          Promise.resolve({ success: true, data: [] }),
        principalApi.getStudentById(Number(id)),
      ]);

      if (classesRes.success) {
        setClasses(classesRes.data);
      }
      if (yearsRes.success) {
        setAcademicYears(yearsRes.data);
      }
      if (studentRes.success) {
        setStudentName(studentRes.data.User.fullName);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!selectedClass || !selectedYear) {
      Alert.alert("خطا", "لطفاً صنف و سال تعلیمی را انتخاب کنید");
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.promoteStudent(Number(id), {
        toClassId: selectedClass,
        academicYearId: selectedYear,
        notes: notes || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "درخواست ارتقا با موفقیت ثبت شد", [
          {
            text: "باشه",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت درخواست ارتقا");
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

      <Text style={styles.title}>ارتقا صنف شاگرد</Text>
      <Text style={styles.subtitle}>{studentName}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>صنف جدید</Text>
        <View style={styles.optionsGrid}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.optionItem,
                selectedClass === cls.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedClass(cls.id)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedClass === cls.id && styles.optionTextSelected,
                ]}
              >
                {cls.name} {cls.section}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>سال تعلیمی</Text>
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
                {year.isActive && " (جاری)"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>یادداشت</Text>
        <TextInput
          style={styles.textInput}
          placeholder="یادداشت اختیاری..."
          placeholderTextColor="#94a3b8"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handlePromote}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="arrow-up-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>ثبت درخواست ارتقا</Text>
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
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "Vazir",
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
  textInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    minHeight: 80,
    fontFamily: "Vazir",
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
