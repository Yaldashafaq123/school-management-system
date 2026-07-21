// app/(hr)/documents/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Document = {
  id: number;
  userId: number;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  isConfidential: boolean;
  User: { fullName: string };
  Uploader: { fullName: string };
  createdAt: string;
};

const DOCUMENT_TYPES = {
  CONTRACT: {
    label: "قرارداد",
    icon: "document-text-outline",
    color: "#3b82f6",
  },
  CERTIFICATE: {
    label: "مدرک تحصیلی",
    icon: "school-outline",
    color: "#10b981",
  },
  RECOMMENDATION: {
    label: "توصیه‌نامه",
    icon: "mail-outline",
    color: "#f59e0b",
  },
  WARNING: { label: "اخطار", icon: "alert-circle-outline", color: "#ef4444" },
  POLICY: { label: "سیاست‌نامه", icon: "document-outline", color: "#8b5cf6" },
  OTHER: { label: "سایر", icon: "folder-outline", color: "#94a3b8" },
};

export default function DocumentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/documents`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setDocuments(result.data.documents);
      }
    } catch (error) {
      console.error("Fetch documents error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDocuments();
  };

  const handleDelete = (id: number) => {
    Alert.alert("حذف سند", "آیا مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/api/hr/documents/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${await getToken()}` },
              },
            );
            const result = await response.json();
            if (result.success) {
              Alert.alert("موفقیت", "سند حذف شد");
              fetchDocuments();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در حذف سند");
          }
        },
      },
    ]);
  };

  const handleDownload = (document: Document) => {
    Alert.alert(
      "دانلود سند",
      `آیا می‌خواهید سند "${document.title}" را دانلود کنید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "دانلود",
          onPress: () => {
            // Implement download logic
            Alert.alert("موفقیت", "دانلود سند شروع شد");
          },
        },
      ],
    );
  };

  const getDocumentTypeInfo = (type: string) => {
    return (
      DOCUMENT_TYPES[type as keyof typeof DOCUMENT_TYPES] ||
      DOCUMENT_TYPES.OTHER
    );
  };

  const renderDocument = ({ item }: { item: Document }) => {
    const typeInfo = getDocumentTypeInfo(item.type);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.documentIcon,
              { backgroundColor: typeInfo.color + "15" },
            ]}
          >
            <Ionicons
              name={typeInfo.icon as any}
              size={24}
              color={typeInfo.color}
            />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.documentTitle}>{item.title}</Text>
              {item.isConfidential && (
                <View style={styles.confidentialBadge}>
                  <Ionicons name="lock-closed" size={10} color="#f59e0b" />
                  <Text style={styles.confidentialText}>محرمانه</Text>
                </View>
              )}
            </View>
            <View style={styles.typeRow}>
              <Text style={[styles.documentType, { color: typeInfo.color }]}>
                {typeInfo.label}
              </Text>
              <Text style={styles.documentStaff}>
                {item.User?.fullName || "عمومی"}
              </Text>
            </View>
          </View>
        </View>

        {item.description && (
          <View style={styles.descriptionContainer}>
            <Ionicons name="text-outline" size={14} color="#94a3b8" />
            <Text style={styles.documentDesc}>{item.description}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="time-outline" size={14} color="#94a3b8" />
            <Text style={styles.documentDate}>
              {new Date(item.createdAt).toLocaleDateString("fa-IR")}
            </Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButton]}
              onPress={() => handleDownload(item)}
            >
              <Ionicons name="download-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderStats = () => {
    const total = documents.length;
    const confidential = documents.filter((d) => d.isConfidential).length;
    const types = documents.reduce(
      (acc, doc) => {
        const type = doc.type || "OTHER";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{total}</Text>
          <Text style={styles.statLabel}>کل اسناد</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{confidential}</Text>
          <Text style={styles.statLabel}>محرمانه</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Object.keys(types).length}</Text>
          <Text style={styles.statLabel}>نوع سند</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مرکز اسناد</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(hr)/documents/upload")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {documents.length > 0 && renderStats()}

      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyTitle}>هیچ سندی یافت نشد</Text>
            <Text style={styles.emptyText}>اولین سند خود را آپلود کنید</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(hr)/documents/upload")}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>آپلود سند</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
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
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  backButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
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
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  documentInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
    flex: 1,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  documentType: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Vazir",
  },
  documentStaff: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  confidentialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  confidentialText: {
    fontSize: 9,
    color: "#f59e0b",
    fontFamily: "Vazir",
    fontWeight: "600",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  documentDesc: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  documentDate: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  cardActions: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    backgroundColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
