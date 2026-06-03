import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Parent {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  childrenCount: number;
  children: { id: number; name: string; className: string }[];
}

export default function ParentsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getAllUsers({
        role: "PARENT",
        search: searchQuery || undefined,
        limit: 100,
      });
      
      if (response.success) {
        const parentData = (response.data.users || []).map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          childrenCount: u.parent?.children?.length || 0,
          children: u.parent?.children?.map((c: any) => ({
            id: c.id,
            name: c.name,
            className: c.className,
          })) || [],
        }));
        setParents(parentData);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error loading parents:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const parentsWithChildren = parents.filter(p => p.childrenCount > 0).length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت والدین" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت والدین" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{total}</Text>
          <Text style={styles.summaryLabel}>کل والدین</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>{parentsWithChildren}</Text>
          <Text style={styles.summaryLabel}>دارای فرزند</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی والد..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={parents}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.parentCard}
            onPress={() => router.push(`/(admin)/financial/users/parents/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.parentAvatar}>
                <Text style={styles.avatarText}>{item.fullName?.charAt(0) || "؟"}</Text>
              </View>
              <View style={styles.parentInfo}>
                <Text style={styles.parentName}>{item.fullName}</Text>
                <Text style={styles.parentEmail}>{item.email}</Text>
              </View>
              <View style={styles.childrenBadge}>
                <Ionicons name="people" size={12} color={Colors.primary} />
                <Text style={styles.childrenCount}>{item.childrenCount} فرزند</Text>
              </View>
            </View>

            {item.children.length > 0 && (
              <View style={styles.childrenPreview}>
                {item.children.slice(0, 2).map((child) => (
                  <View key={child.id} style={styles.childChip}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childClass}>{child.className}</Text>
                  </View>
                ))}
                {item.children.length > 2 && (
                  <Text style={styles.moreText}>+{item.children.length - 2} نفر دیگر</Text>
                )}
              </View>
            )}

            <View style={styles.cardFooter}>
              {item.phone && (
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{item.phone}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>والدی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? "والدی با این مشخصات یافت نشد" : "هیچ والدی ثبت نشده است"}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/(admin)/financial/users/parents/create")}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>افزودن والد جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(admin)/financial/users/parents/create")}
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

  summaryBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryItem: { alignItems: "center" },
  summaryDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },

  listContent: { padding: 16, paddingTop: 0, paddingBottom: 80 },

  parentCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  parentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  parentInfo: { flex: 1 },
  parentName: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  parentEmail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  childrenBadge: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.primary}10`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  childrenCount: { fontSize: 11, color: Colors.primary, fontFamily: "Vazirmatn" },

  childrenPreview: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  childChip: { backgroundColor: `${Colors.info}10`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  childName: { fontSize: 11, color: Colors.info, fontFamily: "Vazirmatn" },
  childClass: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginLeft: 4 },
  moreText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", alignSelf: "center" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  contactText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  addButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },

  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});