import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ReportItem {
  title: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  badge?: string;
}

const reportItems: ReportItem[] = [
  {
    title: "صورت سود و زیان",
    description: "گزارش درآمد و هزینه‌ها به تفکیک ماه‌های سال",
    icon: "bar-chart",
    color: Colors.success,
    path: "/(admin)/financial/reports/income-statement",
  },
  {
    title: "گزارش جریان نقدی",
    description: "ورودی و خروجی وجوه نقد در بازه زمانی مشخص",
    icon: "trending-up",
    color: Colors.primary,
    path: "/(admin)/financial/reports/cash-flow",
  },
  {
    title: "دریافتی روزانه",
    description: "گزارش جمع‌آوری شهریه به تفکیک روز",
    icon: "today",
    color: Colors.info,
    path: "/(admin)/financial/reports/collections/daily",
  },
  {
    title: "دریافتی ماهانه",
    description: "خلاصه درآمد ماهانه و مقایسه با ماه‌های قبل",
    icon: "calendar",
    color: Colors.warning,
    path: "/(admin)/financial/reports/collections/monthly",
  },
  {
    title: "دریافتی به تفکیک صنف",
    description: "مقایسه وصولی شهریه بین صنوف مختلف",
    icon: "school",
    color: Colors.success,
    path: "/(admin)/financial/reports/collections/by-class",
  },
  {
    title: "گزارش فیس‌های معوقه",
    description: "لیست دانش‌آموزان با شهریه پرداخت نشده",
    icon: "alert-circle",
    color: Colors.danger,
    path: "/(admin)/financial/reports/outstanding",
  },
  {
    title: "گزارش پیری معوقات",
    description: "تفکیک معوقات بر اساس ۳۰، ۶۰ و ۹۰ روز",
    icon: "time",
    color: Colors.warning,
    path: "/(admin)/financial/reports/outstanding/aging",
  },
  {
    title: "هزینه‌ها به تفکیک دسته",
    description: "تحلیل هزینه‌ها بر اساس دسته‌بندی",
    icon: "pie-chart",
    color: Colors.danger,
    path: "/(admin)/financial/expenses",
  },
];

export default function ReportsMenu() {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گزارشات مالی" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="analytics" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.title}>گزارشات مالی</Text>
          <Text style={styles.subtitle}>
            گزارشات جامع برای تحلیل و تصمیم‌گیری مالی مدرسه
          </Text>
        </View>

        {/* Report Cards Grid */}
        <View style={styles.grid}>
          {reportItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => navigateTo(item.path)}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.cardArrow}>
                <View style={[styles.arrowCircle, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name="arrow-back" size={16} color={item.color} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Export Section */}
        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>گزارشات قابل خروجی</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => navigateTo("/(admin)/financial/reports/exports")}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
              <Text style={styles.exportBtnText}>خروجی PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exportBtn}
              onPress={() => navigateTo("/(admin)/financial/reports/exports")}
              activeOpacity={0.7}
            >
              <Ionicons name="grid-outline" size={22} color={Colors.success} />
              <Text style={styles.exportBtnText}>خروجی Excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            گزارشات مالی به شما کمک می‌کنند تا وضعیت درآمدها، هزینه‌ها، شهریه‌های معوقه
            و روندهای مالی مدرسه را به صورت دقیق بررسی کنید.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  
  header: { alignItems: "center", marginBottom: 24 },
  headerIconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center", marginBottom: 14 },
  title: { fontSize: 22, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8 },
  subtitle: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", lineHeight: 22 },
  
  grid: { gap: 12, marginBottom: 24 },
  card: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 14, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 3, gap: 14 },
  cardIcon: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  cardDescription: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 18, textAlign: "right" },
  cardArrow: { justifyContent: "center" },
  arrowCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  
  exportSection: { marginBottom: 20 },
  exportTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },
  exportButtons: { flexDirection: "row", gap: 12 },
  exportBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.card, paddingVertical: 14, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: Colors.border },
  exportBtnText: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  
  infoBox: { flexDirection: "row", backgroundColor: `${Colors.primary}08`, borderRadius: 12, padding: 14, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
});