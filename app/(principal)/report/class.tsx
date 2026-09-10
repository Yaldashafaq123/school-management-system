// app/(principal)/reports/class.tsx

import {
    AcademicYearForExcel,
    ClassForExcel,
    excelReportApi,
} from "@/src/config/excelReportApi";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ClassReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [classes, setClasses] = useState<ClassForExcel[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearForExcel[]>(
    [],
  );
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Define fetchData first
  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, yearsRes] = await Promise.all([
        excelReportApi.getAvailableClasses(),
        excelReportApi.getAcademicYears(),
      ]);

      if (classesRes.success) {
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClass(classesRes.data[0].id);
        }
      }

      if (yearsRes.success) {
        setAcademicYears(yearsRes.data);
        const activeYear = yearsRes.data.find((y) => y.isActive);
        if (activeYear) {
          setSelectedYear(activeYear.id);
        } else if (yearsRes.data.length > 0) {
          setSelectedYear(yearsRes.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Then use it in useEffect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleGenerateReport = async () => {
    if (!selectedClass) {
      Alert.alert("خطا", "لطفاً یک صنف را انتخاب کنید");
      return;
    }

    if (!selectedYear) {
      Alert.alert("خطا", "لطفاً یک سال تحصیلی را انتخاب کنید");
      return;
    }

    try {
      setGenerating(true);
      const result = await excelReportApi.generateClassExcel(
        selectedClass,
        selectedYear,
      );

      if (result.success) {
        Alert.alert("موفقیت", "راپور با موفقیت تولید و دانلود شد!");
      } else {
        Alert.alert("خطا", result.message || "خطا در تولید راپور");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      Alert.alert("خطا", "خطا در تولید راپور. لطفاً دوباره تلاش کنید.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>راپور صنف</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>انتخاب صنف</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClass}
            onValueChange={(value) => setSelectedClass(value)}
            style={styles.picker}
            dropdownIconColor="#64748b"
          >
            {classes.map((cls) => (
              <Picker.Item
                key={cls.id}
                label={`${cls.fullName} (${cls.studentCount} شاگرد)`}
                value={cls.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={[styles.label, { marginTop: 16 }]}>سال تحصیلی</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedYear}
            onValueChange={(value) => setSelectedYear(value)}
            style={styles.picker}
            dropdownIconColor="#64748b"
          >
            {academicYears.map((year) => (
              <Picker.Item
                key={year.id}
                label={`${year.name} ${year.isActive ? "(فعال)" : ""}`}
                value={year.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Class Info Card */}
      {selectedClassData && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>معلومات صنف</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نام صنف:</Text>
            <Text style={styles.infoValue}>{selectedClassData.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>استاد صنف:</Text>
            <Text style={styles.infoValue}>
              {selectedClassData.teacherName}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تعداد شاگردان:</Text>
            <Text style={styles.infoValue}>
              {selectedClassData.studentCount}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>سال تحصیلی:</Text>
            <Text style={styles.infoValue}>
              {selectedClassData.academicYear}
            </Text>
          </View>
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[
          styles.generateButton,
          generating && styles.generateButtonDisabled,
        ]}
        onPress={handleGenerateReport}
        disabled={generating}
      >
        {generating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.generateButtonText}>دریافت راپور Excel</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.noteContainer}>
        <Ionicons name="information-circle" size={20} color="#94a3b8" />
        <Text style={styles.noteText}>
          راپور شامل نمرات، حضور و غیاب و معلومات کامل شاگردان صنف می‌باشد
        </Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  picker: {
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  infoValue: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  generateButton: {
    flexDirection: "row",
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    elevation: 3,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  generateButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "Vazir",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
});
