// app/(parent)/child-switch.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Child, parentChildApi } from "@/src/config/parentChildApi";
import { useRouter } from "expo-router";
import { Check, User } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
export default function ChildSwitch() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadChildren = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parentChildApi.getChildren();
      if (response.success && response.data) {
        setChildren(response.data.children);
        setActiveChildId(response.data.activeChildId);
      }
    } catch (error) {
      console.error("Error loading children:", error);
      Alert.alert("خطا", "خطا در بارگذاری اطلاعات فرزندان");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const handleSelectChild = async (childId: number) => {
    if (childId === activeChildId) {
      router.back();
      return;
    }

    setSubmitting(true);
    try {
      const response = await parentChildApi.setActiveChild(childId);
      if (response.success) {
        setActiveChildId(childId);
        Alert.alert("موفقیت", response.message);
        router.back();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در تغییر فرزند فعال");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddChild = () => {
    Alert.alert(
      "افزودن فرزند",
      "برای افزودن فرزند جدید لطفاً با مدیریت مدرسه تماس بگیرید",
      [{ text: "باشه" }],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>انتخاب فرزند</Text>
        <Text style={styles.subtitle}>
          انتخاب کنید کدام فرزند را مشاهده کنید
        </Text>
      </View>

      <ScrollView
        style={styles.childrenList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
          />
        }
      >
        {children.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>فرزندی ثبت نشده</Text>
            <Text style={styles.emptyStateText}>
              برای افزودن فرزند لطفاً با مدیریت مدرسه تماس بگیرید
            </Text>
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.childCard,
                child.active && styles.activeChild,
                submitting && styles.disabled,
              ]}
              onPress={() => handleSelectChild(child.id)}
              disabled={submitting}
            >
              <View style={styles.childInfo}>
                <View style={styles.avatar}>
                  {child.profileImage ? (
                    <Image
                      source={{ uri: child.profileImage }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <User size={24} color="#4b5563" />
                  )}
                </View>
                <View style={styles.childDetails}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childClass}>{child.class}</Text>
                  {child.attendanceRate !== undefined && (
                    <Text style={styles.childStats}>
                      حضور: {child.attendanceRate}٪
                    </Text>
                  )}
                </View>
              </View>
              {child.active && (
                <View style={styles.activeBadge}>
                  <Check size={24} color="#10b981" />
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, submitting && styles.disabled]}
        onPress={handleAddChild}
        disabled={submitting}
      >
        <Text style={styles.addButtonText}>+ افزودن فرزند جدید</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  childrenList: {
    flex: 1,
    padding: 20,
  },
  childCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeChild: {
    borderColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  disabled: {
    opacity: 0.6,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  childDetails: {
    gap: 4,
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  childClass: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  childStats: {
    fontSize: 12,
    color: "#3b82f6",
    textAlign: "right",
    marginTop: 2,
  },
  activeBadge: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "white",
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    margin: 20,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
