// app/(teacher)/requests/leave.tsx - Connected to Backend
import { teacherApi } from "@/src/config/teacherApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";

const LEAVE_TYPES = [
  { key: "ANNUAL", label: "مرخصی سالانه" },
  { key: "SICK", label: "مرخصی استعلاجی" },
  { key: "EMERGENCY", label: "مرخصی اضطرار" },
  { key: "MATERNITY", label: "مرخصی مادران" },
  { key: "UNPAID", label: "مرخصی بدون معاش" },
];

export default function RequestLeaveScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "ANNUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    fetchLeaveBalance();
  }, []);

  const fetchLeaveBalance = async () => {
    try {
      const response = await teacherApi.getLeaveBalance();
      if (response.success) {
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error("Fetch leave balance error:", error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.startDate || !formData.endDate) {
      Alert.alert("خطا", "لطفاً تاریخ شروع و پایان را وارد کنید");
      return;
    }

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      Alert.alert("خطا", "تاریخ شروع باید قبل از تاریخ پایان باشد");
      return;
    }

    setLoading(true);
    try {
      const response = await teacherApi.requestLeave({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      if (response.success) {
        Alert.alert("موفقیت", "درخواست مرخصی با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت درخواست");
    } finally {
      setLoading(false);
    }
  };

  const getBalanceForType = (type: string) => {
    if (!leaveBalance) return null;
    const map: Record<
      string,
      { used: number; total: number; remaining: number }
    > = {
      ANNUAL: {
        used: leaveBalance.usedAnnual,
        total: leaveBalance.annualLeave,
        remaining: leaveBalance.remainingAnnual,
      },
      SICK: {
        used: leaveBalance.usedSick,
        total: leaveBalance.sickLeave,
        remaining: leaveBalance.remainingSick,
      },
      EMERGENCY: {
        used: leaveBalance.usedEmergency,
        total: leaveBalance.emergencyLeave,
        remaining: leaveBalance.remainingEmergency,
      },
      MATERNITY: {
        used: leaveBalance.usedMaternity,
        total: leaveBalance.maternityLeave,
        remaining: leaveBalance.remainingMaternity,
      },
    };
    return map[type] || null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>درخواست مرخصی</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <Text style={styles.label}>نوع مرخصی</Text>
          <View style={styles.optionsGrid}>
            {LEAVE_TYPES.map((type) => {
              const balance = getBalanceForType(type.key);
              const isAvailable = balance && balance.remaining > 0;
              const isSelected = formData.type === type.key;

              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.optionItem,
                    isSelected && styles.optionSelected,
                    !isAvailable && styles.optionDisabled,
                  ]}
                  onPress={() => {
                    if (isAvailable || type.key === "UNPAID") {
                      setFormData({ ...formData, type: type.key });
                    } else {
                      Alert.alert(
                        "اطلاع",
                        `موجودی ${type.label} به پایان رسیده است`,
                      );
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                      !isAvailable && styles.optionTextDisabled,
                    ]}
                  >
                    {type.label}
                  </Text>
                  {balance && (
                    <Text style={styles.balanceText}>
                      {balance.remaining} روز
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>تاریخ شروع *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={formData.startDate}
            onChangeText={(text) =>
              setFormData({ ...formData, startDate: text })
            }
          />

          <Text style={styles.label}>تاریخ پایان *</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={formData.endDate}
            onChangeText={(text) => setFormData({ ...formData, endDate: text })}
          />

          <Text style={styles.label}>دلیل</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="دلیل درخواست مرخصی..."
            placeholderTextColor="#94a3b8"
            value={formData.reason}
            onChangeText={(text) => setFormData({ ...formData, reason: text })}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>
              درخواست شما به مدیریت ارسال می‌شود و پس از تایید، مرخصی شما ثبت
              می‌گردد.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>ثبت درخواست</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Leave Balance Info */}
        {!loadingBalance && leaveBalance && (
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>موجودی مرخصی</Text>
            <View style={styles.balanceGrid}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>سالانه</Text>
                <Text style={styles.balanceValue}>
                  {leaveBalance.remainingAnnual} روز
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>مرخصی بیماری</Text>
                <Text style={styles.balanceValue}>
                  {leaveBalance.remainingSick} روز
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>اضطرار</Text>
                <Text style={styles.balanceValue}>
                  {leaveBalance.remainingEmergency} روز
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  textArea: { minHeight: 100 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    minWidth: 80,
  },
  optionSelected: { backgroundColor: "#dbeafe", borderColor: Colors.primary },
  optionDisabled: { opacity: 0.5 },
  optionText: { fontSize: 14, color: "#64748b" },
  optionTextSelected: { color: Colors.primary, fontWeight: "600" },
  optionTextDisabled: { color: "#94a3b8" },
  balanceText: { fontSize: 10, color: "#10b981", marginTop: 2 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#dbeafe",
    borderRadius: 10,
    padding: 12,
    gap: 10,
    marginTop: 16,
  },
  infoText: { flex: 1, fontSize: 13, color: "#64748b" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  balanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  balanceGrid: { flexDirection: "row", justifyContent: "space-around" },
  balanceItem: { alignItems: "center" },
  balanceLabel: { fontSize: 13, color: "#64748b" },
  balanceValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 2,
  },
});
