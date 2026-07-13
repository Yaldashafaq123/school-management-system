// app/(admin)/financial/payments/bulk/index.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { financeApi, ClassItem } from "@/src/config/financeApi";
import { EmptyState } from "@/components/finance/EmptyState";

export default function BulkPaymentClassSelectionScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      const response = await financeApi.getClassesList();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Fetch classes error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClass = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => router.push(`/financial/payments/bulk/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.classIcon}>
        <Ionicons name="people" size={28} color="#8b5cf6" />
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.className}>
          {item.name} {item.section ? `- ${item.section}` : ""}
        </Text>
        <Text style={styles.classCount}>
          {item.studentCount} شاگرد
        </Text>
      </View>
      <View style={styles.classArrow}>
        <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری صنف‌ها...</Text>
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
        <Text style={styles.title}>پرداخت جمعی</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={20} color="#3b82f6" />
        <Text style={styles.infoText}>
          صنف مورد نظر را برای پرداخت جمعی انتخاب کنید
        </Text>
      </View>

      {classes.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="هیچ صنفی موجود نیست"
          subtitle="ابتدا صنف‌ها را ایجاد کنید"
        />
      ) : (
        <FlatList
          data={classes}
          renderItem={renderClass}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
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
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  classIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classCount: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  classArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
});