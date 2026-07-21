// app/(hr)/id-cards/index.tsx
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

type IdCard = {
  id: number;
  userId: number;
  cardNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  User: {
    fullName: string;
    email: string;
    phone: string;
    profileImage: string;
    role: string;
  };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "#10b981";
    case "PENDING":
      return "#f59e0b";
    case "EXPIRED":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "فعال";
    case "PENDING":
      return "در انتظار";
    case "EXPIRED":
      return "منقضی";
    default:
      return status;
  }
};

export default function IdCardsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cards, setCards] = useState<IdCard[]>([]);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/id-cards`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setCards(result.data.cards);
      }
    } catch (error) {
      console.error("Fetch ID cards error:", error);
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
    fetchCards();
  };

  const handlePrint = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/id-cards/${id}/print`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "کارت با موفقیت چاپ شد");
        fetchCards();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در چاپ کارت");
    }
  };

  const renderCard = ({ item }: { item: IdCard }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.User?.fullName?.charAt(0) || "?"}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.staffName}>
            {item.User?.fullName || "نامشخص"}
          </Text>
          <Text style={styles.cardNumber}>شماره: {item.cardNumber}</Text>
          <Text style={styles.staffRole}>{item.User?.role || ""}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          تاریخ صدور: {new Date(item.issueDate).toLocaleDateString("fa-IR")}
        </Text>
        <Text style={styles.dateText}>
          انقضا: {new Date(item.expiryDate).toLocaleDateString("fa-IR")}
        </Text>
        {item.status === "PENDING" && (
          <TouchableOpacity
            style={styles.printButton}
            onPress={() => handlePrint(item.id)}
          >
            <Ionicons name="print-outline" size={18} color="#fff" />
            <Text style={styles.printText}>چاپ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

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

      {/* Header - now properly separated from SafeAreaView */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>کارت‌های شناسایی</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(hr)/id-cards/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ کارتی یافت نشد</Text>
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
    // Add elevation for better visual separation
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
    minWidth: 40, // Ensure consistent touch area
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
  listContent: {
    padding: 16,
    gap: 12,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  cardInfo: {
    flex: 1,
    marginRight: 4,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  cardNumber: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  staffRole: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 60,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    flexWrap: "wrap",
    gap: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
    flex: 1,
  },
  printButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  printText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
