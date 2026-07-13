// app/(admin)/financial/salaries/generate.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  financeApi,
  formatCurrency,
  getAfghanMonths,
} from "@/src/config/financeApi";
import { MonthPicker } from "@/components/finance/MonthPicker";
import { EmptyState } from "@/components/finance/EmptyState";

export default function GenerateSalariesScreen() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(1403);
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      // Fetch active teachers
      const response = await financeApi.getSalaries(); // Using this as proxy
      // In production, you'd have a dedicated endpoint for teachers list
      // For now, we'll show from existing salary data
      if (response.success) {
        const uniqueTeachers = (response.data || []).filter(
          (v: any, i: number, a: any[]) =>
            a.findIndex((t) => t.teacherId === v.teacherId) === i,
        );
        setTeachers(
          uniqueTeachers.map((t: any) => ({
            id: t.teacherId,
            name: t.teacher?.user?.fullName || "استاد",
            baseSalary: Number(t.baseSalary || 0),
            overtimeRate: Number(t.overtimeRate || 0),
          })),
        );
      }
    } catch (error) {
      console.error("Load teachers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedMonth) {
      Alert.alert("خطا", "ماه را انتخاب کنید");
      return;
    }

    setGenerating(true);
    try {
      const monthIndex =
        getAfghanMonths().findIndex((m) => m.key === selectedMonth) + 1;

      const response = await financeApi.generateSalaries({
        month: monthIndex,
        year: selectedYear,
      });

      if (response.success) {
        Alert.alert(
          "موفقیت",
          `معاشات ماه ${getAfghanMonths().find((m) => m.key === selectedMonth)?.name} با موفقیت تولید شد`,
          [{ text: "باشه", onPress: () => router.back() }],
        );
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "تولید معاشات با مشکل مواجه شد");
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = () => {
    if (!selectedMonth) {
      Alert.alert("خطا", "ماه را انتخاب کنید");
      return;
    }
    // Generate preview
    setPreviewData(
      teachers.map((t) => ({
        ...t,
        baseSalaryAmount: t.baseSalary,
        overtimeAmount: 0,
        bonusAmount: 0,
        deductionAmount: 0,
        total: t.baseSalary,
      })),
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>تولید معاشات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Month/Year Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>انتخاب ماه و سال</Text>

          <View style={styles.pickerRow}>
            <View style={styles.pickerHalf}>
              <MonthPicker
                value={selectedMonth}
                onSelect={setSelectedMonth}
                label="ماه"
              />
            </View>
            <View style={styles.yearPicker}>
              <TouchableOpacity
                onPress={() => setSelectedYear((prev) => prev - 1)}
              >
                <Ionicons name="chevron-back" size={20} color="#3b82f6" />
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity
                onPress={() => setSelectedYear((prev) => prev + 1)}
              >
                <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              !selectedMonth && styles.generateDisabled,
            ]}
            onPress={handlePreview}
            disabled={!selectedMonth}
          >
            <Ionicons name="eye-outline" size={20} color="#fff" />
            <Text style={styles.generateText}>پیش‌نمایش</Text>
          </TouchableOpacity>
        </View>

        {/* Teachers Preview */}
        {previewData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              پیش‌نمایش معاشات ({previewData.length} استاد)
            </Text>

            {previewData.map((teacher, index) => (
              <View key={index} style={styles.teacherCard}>
                <View style={styles.teacherHeader}>
                  <Ionicons name="person-circle" size={32} color="#f97316" />
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.teacherSalary}>
                      معاش پایه: {formatCurrency(teacher.baseSalaryAmount)}
                    </Text>
                  </View>
                  <Text style={styles.teacherTotal}>
                    {formatCurrency(teacher.total)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Total */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>مجموع معاشات:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  previewData.reduce((sum, t) => sum + t.total, 0),
                )}
              </Text>
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#3b82f6" />
          <Text style={styles.infoText}>
            معاشات بر اساس معاش پایه اساتید و اضافه‌کاری ثبت شده محاسبه می‌شود.
            پس از تولید، می‌توانید هر معاش را ویرایش کنید.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Confirm Button */}
      {previewData.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, generating && styles.confirmDisabled]}
            onPress={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.confirmText}>
                  تولید معاشات{" "}
                  {getAfghanMonths().find((m) => m.key === selectedMonth)?.name}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  pickerHalf: {
    flex: 1,
  },
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-end",
    marginTop: 28,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  generateDisabled: {
    backgroundColor: "#d1d5db",
  },
  generateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  teacherCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  teacherHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  teacherSalary: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  teacherTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f97316",
    fontFamily: "VazirBold",
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f97316",
    fontFamily: "VazirBold",
  },
  infoCard: {
    flexDirection: "row",
    margin: 16,
    padding: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3b82f6",
    lineHeight: 20,
    fontFamily: "Vazir",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  confirmDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
