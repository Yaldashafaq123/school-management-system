import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, FeeTemplate as ApiFeeTemplate } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface FeeTemplate {
  id: number;
  classId: number;
  className: string;
  feeCategoryId: number;
  feeTitle: string;
  amount: number;
  frequency: string;
  dueDay: number;
  isActive: boolean;
  assignedStudents: number;
}

export default function FeeTemplatesList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<FeeTemplate[]>([]);

  const loadTemplates = useCallback(async () => {
    try {
      const response = await financeApi.getFeeTemplates();
      if (response.success) {
        // Transform API data to match FeeTemplate interface with fallback for assignedStudents
        const transformedTemplates: FeeTemplate[] = (response.data || []).map((template: ApiFeeTemplate) => ({
          id: template.id,
          classId: template.classId,
          className: template.className,
          feeCategoryId: template.feeCategoryId,
          feeTitle: template.feeTitle,
          amount: template.amount,
          frequency: template.frequency,
          dueDay: template.dueDay,
          isActive: template.isActive,
          assignedStudents: template.assignedStudents || 0,
        }));
        setTemplates(transformedTemplates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری قالب‌ها پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadTemplates();
  };

  const handleDelete = (template: FeeTemplate) => {
    Alert.alert(
      "حذف قالب",
      `آیا از حذف قالب "${template.feeTitle}" برای ${template.className} مطمئن هستید؟`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await financeApi.deleteFeeTemplate(template.id);
              Alert.alert("موفق", "قالب با موفقیت حذف شد");
              loadTemplates();
            } catch (error: any) {
              Alert.alert("خطا", error?.message || "حذف قالب ناموفق بود");
            }
          },
        },
      ]
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "MONTHLY": return "ماهانه";
      case "YEARLY": return "سالانه";
      case "ONE_TIME": return "یکباره";
      default: return frequency;
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case "MONTHLY": return "repeat";
      case "YEARLY": return "calendar";
      case "ONE_TIME": return "flash";
      default: return "pricetag";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="قالب‌های شهریه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="قالب‌های شهریه" showBack />

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>مدیریت قالب‌های شهریه</Text>
            <Text style={styles.headerDesc}>
              قالب‌ها به شما امکان می‌دهند هزینه‌های دوره‌ای را برای هر صنف تعریف کنید و به صورت خودکار به دانش‌آموزان اعمال نمایید.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <View style={styles.cardHeader}>
              <View style={styles.classInfo}>
                <View style={[styles.classIcon, { backgroundColor: `${Colors.primary}15` }]}>
                  <Ionicons name="school" size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.className}>{item.className}</Text>
                  <Text style={styles.feeTitle}>{item.feeTitle}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
                  {item.isActive ? "فعال" : "غیرفعال"}
                </Text>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="cash" size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>مبلغ:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(item.amount)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name={getFrequencyIcon(item.frequency) as any} size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>دوره:</Text>
                  <Text style={styles.detailValue}>{getFrequencyLabel(item.frequency)}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>روز سررسید:</Text>
                  <Text style={styles.detailValue}>{item.dueDay} هر ماه</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="people" size={14} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>تخصیص:</Text>
                  <Text style={styles.detailValue}>{item.assignedStudents} دانش‌آموز</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.primary}15` }]}
                onPress={() => router.push(`/(admin)/financial/fees/templates/${item.id}` as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>ویرایش</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.success}15` }]}
                onPress={() => router.push(`/(admin)/financial/fees/templates/assign?templateId=${item.id}` as any)}
                activeOpacity={0.7}
              >
                <Ionicons name="people" size={16} color={Colors.success} />
                <Text style={[styles.actionText, { color: Colors.success }]}>تخصیص</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.danger}15` }]}
                onPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                <Text style={[styles.actionText, { color: Colors.danger }]}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>قالبی ثبت نشده است</Text>
            <Text style={styles.emptyDesc}>
              برای شروع، یک قالب شهریه جدید ایجاد کنید
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/(admin)/financial/fees/templates/create" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.createButtonText}>ایجاد قالب جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(admin)/financial/fees/templates/create" as any)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  listContent: { padding: 16, paddingBottom: 80 },
  headerInfo: { marginBottom: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right", marginBottom: 8 },
  headerDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "right", lineHeight: 20 },
  templateCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  classInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  classIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  className: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  feeTitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  activeBadge: { backgroundColor: `${Colors.success}15` },
  inactiveBadge: { backgroundColor: `${Colors.danger}15` },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  activeText: { color: Colors.success },
  inactiveText: { color: Colors.danger },
  cardBody: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 12, gap: 8 },
  detailRow: { flexDirection: "row", gap: 16 },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  detailLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  detailValue: { fontSize: 12, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, gap: 6 },
  actionText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  createButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  createButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },
  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});