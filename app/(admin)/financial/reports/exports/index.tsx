import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface ExportOptions {
  reportType: "income-statement" | "collections" | "outstanding" | "expenses";
  format: "pdf" | "excel";
  dateRange: {
    start: string;
    end: string;
  };
  includeCharts: boolean;
  includeDetails: boolean;
}

const REPORT_TYPES = [
  { value: "income-statement", label: "صورت سود و زیان", icon: "bar-chart" },
  { value: "collections", label: "گزارش دریافت‌ها", icon: "cash" },
  { value: "outstanding", label: "گزارش معوقات", icon: "alert-circle" },
  { value: "expenses", label: "گزارش هزینه‌ها", icon: "receipt" },
];

export default function ExportReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    reportType: "income-statement",
    format: "excel",
    dateRange: {
      start: "",
      end: "",
    },
    includeCharts: true,
    includeDetails: true,
  });

  const handleExport = async () => {
    if (!options.dateRange.start || !options.dateRange.end) {
      Alert.alert("خطا", "لطفاً بازه زمانی را مشخص کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await financeApi.exportReport(options);
      if (response.success && response.data?.url) {
        // Get the document directory
        const documentDirectory = FileSystem.documentDirectory;
        if (!documentDirectory) {
          Alert.alert("خطا", "خطا در دسترسی به حافظه دستگاه");
          return;
        }
        
        const fileUri = documentDirectory + response.data.filename;
        const downloadResult = await FileSystem.downloadAsync(response.data.url, fileUri);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        } else {
          Alert.alert("موفق", "فایل با موفقیت ایجاد شد");
        }
      } else {
        Alert.alert("خطا", "مشکلی در ایجاد فایل پیش آمد");
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("خطا", "مشکلی در ایجاد فایل پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="خروجی گزارشات" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} />
          <Text style={styles.infoText}>
            گزارشات را در قالب PDF یا Excel دریافت کنید. گزارشات شامل جداول و نمودارهای تحلیلی هستند.
          </Text>
        </View>

        {/* Report Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع گزارش</Text>
          <View style={styles.reportTypesGrid}>
            {REPORT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.reportTypeCard,
                  options.reportType === type.value && styles.reportTypeCardActive,
                ]}
                onPress={() => setOptions({ ...options, reportType: type.value as any })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type.icon as any}
                  size={24}
                  color={options.reportType === type.value ? "white" : Colors.primary}
                />
                <Text style={[styles.reportTypeLabel, options.reportType === type.value && styles.reportTypeLabelActive]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فرمت خروجی</Text>
          <View style={styles.formatRow}>
            <TouchableOpacity
              style={[styles.formatCard, options.format === "excel" && styles.formatCardActive]}
              onPress={() => setOptions({ ...options, format: "excel" })}
              activeOpacity={0.7}
            >
              <Ionicons name="grid" size={28} color={options.format === "excel" ? "white" : Colors.success} />
              <Text style={[styles.formatLabel, options.format === "excel" && styles.formatLabelActive]}>Excel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatCard, options.format === "pdf" && styles.formatCardActive]}
              onPress={() => setOptions({ ...options, format: "pdf" })}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text" size={28} color={options.format === "pdf" ? "white" : Colors.danger} />
              <Text style={[styles.formatLabel, options.format === "pdf" && styles.formatLabelActive]}>PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>بازه زمانی</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>از تاریخ</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="۱۴۰۳/۰۱/۰۱"
                placeholderTextColor={Colors.textSecondary}
                value={options.dateRange.start}
                onChangeText={(text) => setOptions({ ...options, dateRange: { ...options.dateRange, start: text } })}
                textAlign="center"
              />
            </View>
            <Text style={styles.dateSeparator}>تا</Text>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>تا تاریخ</Text>
              <TextInput
                style={styles.dateInput}
                placeholder="۱۴۰۳/۱۲/۲۹"
                placeholderTextColor={Colors.textSecondary}
                value={options.dateRange.end}
                onChangeText={(text) => setOptions({ ...options, dateRange: { ...options.dateRange, end: text } })}
                textAlign="center"
              />
            </View>
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات گزارش</Text>
          
          <View style={styles.optionRow}>
            <View>
              <Text style={styles.optionLabel}>همراه با نمودارها</Text>
              <Text style={styles.optionDesc}>اضافه کردن نمودارهای تحلیلی به گزارش</Text>
            </View>
            <Switch
              value={options.includeCharts}
              onValueChange={(value) => setOptions({ ...options, includeCharts: value })}
              trackColor={{ false: Colors.border, true: `${Colors.primary}50` }}
              thumbColor={options.includeCharts ? Colors.primary : "#f4f3f4"}
            />
          </View>

          <View style={styles.optionRow}>
            <View>
              <Text style={styles.optionLabel}>همراه با جزئیات</Text>
              <Text style={styles.optionDesc}>نمایش جزئیات کامل در گزارش</Text>
            </View>
            <Switch
              value={options.includeDetails}
              onValueChange={(value) => setOptions({ ...options, includeDetails: value })}
              trackColor={{ false: Colors.border, true: `${Colors.primary}50` }}
              thumbColor={options.includeDetails ? Colors.primary : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Preview Info */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>پیش‌نمایش خروجی</Text>
          <View style={styles.previewRow}>
            <Ionicons name="document-text" size={16} color={Colors.primary} />
            <Text style={styles.previewText}>
              {REPORT_TYPES.find(t => t.value === options.reportType)?.label}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Ionicons name="calendar" size={16} color={Colors.primary} />
            <Text style={styles.previewText}>
              {options.dateRange.start || "شروع"} تا {options.dateRange.end || "امروز"}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Ionicons name="options" size={16} color={Colors.primary} />
            <Text style={styles.previewText}>
              فرمت: {options.format === "excel" ? "Excel" : "PDF"} • 
              {options.includeCharts ? " با نمودار" : " بدون نمودار"} • 
              {options.includeDetails ? " با جزئیات" : " خلاصه"}
            </Text>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={[styles.exportButton, loading && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="download-outline" size={22} color="white" />
              <Text style={styles.exportButtonText}>دریافت گزارش</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },

  infoBanner: { flexDirection: "row", backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 12, marginBottom: 20, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },

  reportTypesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  reportTypeCard: { flex: 1, minWidth: "47%", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 8 },
  reportTypeCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reportTypeLabel: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn" },
  reportTypeLabelActive: { color: "white" },

  formatRow: { flexDirection: "row", gap: 12 },
  formatCard: { flex: 1, alignItems: "center", padding: 20, borderRadius: 14, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 8 },
  formatCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  formatLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  formatLabelActive: { color: "white" },

  dateRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  dateInput: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  dateSeparator: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", paddingBottom: 8 },

  optionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  optionLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  optionDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  previewCard: { backgroundColor: `${Colors.primary}08`, borderRadius: 14, padding: 16, marginBottom: 24 },
  previewTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "center" },
  previewRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  previewText: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn", flex: 1, textAlign: "right" },

  exportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 16, gap: 10, marginBottom: 20 },
  exportButtonDisabled: { opacity: 0.6 },
  exportButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});