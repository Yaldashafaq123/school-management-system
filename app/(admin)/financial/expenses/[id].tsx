// app/(admin)/financial/expenses/[id].tsx
import { formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ExpenseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expense, setExpense] = useState<any>(null);

  useEffect(() => {
    // Simulate loading expense details
    setTimeout(() => {
      setExpense({
        id: Number(id),
        category: { id: 1, name: "تعمیرات" },
        amount: 5000,
        description: "تعمیر میز و صندلی‌های صنف ۸",
        date: new Date().toISOString(),
        receiptUrl: null,
        createdBy: { fullName: "محمد کریمی" },
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
    }, 800);
  }, [id]);

  const handleDelete = () => {
    Alert.alert("حذف مصرف", "آیا از حذف این مصرف مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: () => {
          Alert.alert("موفقیت", "مصرف حذف شد", [
            { text: "باشه", onPress: () => router.back() },
          ]);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  if (!expense) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>مصرف پیدا نشد</Text>
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
        <Text style={styles.title}>جزئیات مصرف</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Ionicons name="trash-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountIcon}>
            <Ionicons name="trending-down" size={32} color="#ef4444" />
          </View>
          <Text style={styles.amountLabel}>مبلغ مصرف</Text>
          <Text style={styles.amountValue}>
            - {formatCurrency(Number(expense.amount))}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="pricetag-outline" size={20} color="#64748b" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>دسته‌بندی</Text>
              <Text style={styles.detailValue}>
                {expense.category?.name || "نامشخص"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>تاریخ</Text>
              <Text style={styles.detailValue}>
                {new Date(expense.date || expense.createdAt).toLocaleDateString(
                  "fa-AF",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ثبت کننده</Text>
              <Text style={styles.detailValue}>
                {expense.createdBy?.fullName ||
                  expense.creator?.fullName ||
                  "نامشخص"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>ساعت ثبت</Text>
              <Text style={styles.detailValue}>
                {new Date(expense.createdAt).toLocaleTimeString("fa-AF", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {expense.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>توضیحات</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>{expense.description}</Text>
            </View>
          </View>
        )}

        {/* Receipt */}
        {expense.receiptUrl && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>رسید</Text>
            <Image
              source={{ uri: expense.receiptUrl }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() =>
              router.push(`/financial/expenses/create?id=${expense.id}`)
            }
          >
            <Ionicons name="create-outline" size={20} color="#3b82f6" />
            <Text style={styles.editText}>ویرایش</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.deleteText}>حذف</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    gap: 12,
  },
  errorText: {
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
  scrollView: {
    flex: 1,
  },
  amountCard: {
    margin: 16,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  amountIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ef4444",
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  detailsCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginHorizontal: 14,
  },
  section: {
    margin: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "VazirBold",
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    fontFamily: "Vazir",
  },
  receiptImage: {
    width: "100%",
    height: 300,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  actionsSection: {
    flexDirection: "row",
    margin: 16,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  editButton: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  editText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteText: {
    color: "#ef4444",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
