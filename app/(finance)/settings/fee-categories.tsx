// app/(admin)/financial/settings/fee-categories.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { financeApi, FeeCategory } from "@/src/config/financeApi";
import { EmptyState } from "@/components/finance/EmptyState";

const CATEGORY_COLORS: Record<string, string> = {
  MONTHLY_TUITION: "#3b82f6",
  MONTHLY_TRANSPORT: "#8b5cf6",
  ONE_TIME_ADMISSION: "#10b981",
  ONE_TIME_REGISTRATION: "#f59e0b",
  ONE_TIME_BOOKS: "#ec4899",
  ONE_TIME_UNIFORM: "#06b6d4",
  ONE_TIME_EXAM: "#f97316",
  ANNUAL: "#14b8a6",
  OTHER: "#64748b",
};

const CATEGORY_ICONS: Record<string, string> = {
  MONTHLY_TUITION: "school-outline",
  MONTHLY_TRANSPORT: "bus-outline",
  ONE_TIME_ADMISSION: "person-add-outline",
  ONE_TIME_REGISTRATION: "clipboard-outline",
  ONE_TIME_BOOKS: "book-outline",
  ONE_TIME_UNIFORM: "shirt-outline",
  ONE_TIME_EXAM: "document-text-outline",
  ANNUAL: "calendar-outline",
  OTHER: "ellipsis-horizontal-outline",
};

export default function FeeCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<FeeCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await financeApi.getFeeCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (value: string) => {
    return CATEGORY_COLORS[value] || "#64748b";
  };

  const getCategoryIcon = (value: string) => {
    return CATEGORY_ICONS[value] || "receipt-outline";
  };

  const renderCategory = ({ item }: { item: FeeCategory }) => (
    <View style={styles.categoryCard}>
      <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.value) + "15" }]}>
        <Ionicons
          name={getCategoryIcon(item.value) as any}
          size={24}
          color={getCategoryColor(item.value)}
        />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.label}</Text>
        <View style={styles.categoryMeta}>
          <View style={[styles.typeBadge, { backgroundColor: item.isRecurring ? "#fef3c7" : "#dbeafe" }]}>
            <Text style={[styles.typeText, { color: item.isRecurring ? "#d97706" : "#3b82f6" }]}>
              {item.isRecurring ? "ماهانه" : "یکباره"}
            </Text>
          </View>
          <Text style={styles.typeLabel}>
            نوع: {item.type === "MONTHLY" ? "ماهانه" : item.type === "ONE_TIME" ? "یکباره" : item.type === "ANNUAL" ? "سالانه" : "سایر"}
          </Text>
        </View>
      </View>
      <View style={[styles.categoryColor, { backgroundColor: getCategoryColor(item.value) }]}>
        <Text style={styles.categoryCode}>{item.value.split("_").slice(0, 2).join(" ")}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>دسته‌بندی فیس</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#8b5cf6" />
        <Text style={styles.infoText}>
          این دسته‌بندی‌ها برای ایجاد قالب فیس استفاده می‌شوند
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>دسته‌بندی</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {categories.filter(c => c.isRecurring).length}
          </Text>
          <Text style={styles.statLabel}>ماهانه</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {categories.filter(c => !c.isRecurring).length}
          </Text>
          <Text style={styles.statLabel}>یکباره</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="دسته‌بندی وجود ندارد"
          subtitle="دسته‌بندی‌های فیس در سیستم تعریف نشده"
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.listContent}
        />
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 12,
    backgroundColor: "#f3e8ff",
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#c4b5fd",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#7c3aed",
    fontFamily: "Vazir",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  categoryMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  typeLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  categoryColor: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryCode: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Vazir",
  },
});