// app/(hr)/leaves/balance.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type LeaveBalance = {
  userId: number;
  year: number;
  annualLeave: number;
  sickLeave: number;
  emergencyLeave: number;
  maternityLeave: number;
  usedAnnual: number;
  usedSick: number;
  usedEmergency: number;
  usedMaternity: number;
  remainingAnnual: number;
  remainingSick: number;
  remainingEmergency: number;
  remainingMaternity: number;
  User?: {
    fullName: string;
  };
};

export default function LeaveBalanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [staffId, setStaffId] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!staffId.trim()) {
      Alert.alert("خطا", "لطفاً شناسه کارمند را وارد کنید");
      return;
    }
    setSearching(true);
    setLoading(true);
    await fetchBalance(parseInt(staffId));
  };

  const fetchBalance = async (userId: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves/balance/${userId}`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setBalance(result.data);
      } else {
        Alert.alert("خطا", "کارمند یافت نشد");
        setBalance(null);
      }
    } catch (error) {
      console.error("Fetch balance error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const getTotalUsed = (b: LeaveBalance) => {
    return b.usedAnnual + b.usedSick + b.usedEmergency + b.usedMaternity;
  };

  const getTotalRemaining = (b: LeaveBalance) => {
    return (
      b.remainingAnnual +
      b.remainingSick +
      b.remainingEmergency +
      b.remainingMaternity
    );
  };

  const getTotalEntitled = (b: LeaveBalance) => {
    return b.annualLeave + b.sickLeave + b.emergencyLeave + b.maternityLeave;
  };

  const getUsagePercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const renderBalanceItem = (
    icon: string,
    label: string,
    used: number,
    total: number,
    remaining: number,
    color: string,
    bgColor: string,
  ) => {
    const percentage = getUsagePercentage(used, total);
    const isLow = remaining < total * 0.2;

    return (
      <View style={styles.balanceItem}>
        <View style={[styles.balanceIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <View style={styles.balanceInfo}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>{label}</Text>
            <Text style={styles.balanceValue}>
              {used} / {total} روز
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isLow ? "#ef4444" : color,
                },
              ]}
            />
          </View>
          <View style={styles.balanceFooter}>
            <Text
              style={[
                styles.balanceRemaining,
                isLow && styles.balanceRemainingLow,
              ]}
            >
              <Ionicons
                name="hourglass-outline"
                size={12}
                color={isLow ? "#ef4444" : "#94a3b8"}
              />{" "}
              باقیمانده: {remaining} روز
            </Text>
            {isLow && remaining > 0 && (
              <View style={styles.lowBadge}>
                <Text style={styles.lowBadgeText}>کم</Text>
              </View>
            )}
          </View>
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
        <Text style={styles.headerTitle}>موجودی مرخصی</Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              "راهنما",
              "برای مشاهده موجودی مرخصی یک کارمند، شناسه او را وارد کنید و روی دکمه جستجو بزنید.",
            )
          }
        >
          <Ionicons name="help-circle-outline" size={24} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#94a3b8"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="شناسه کارمند را وارد کنید"
            placeholderTextColor="#94a3b8"
            value={staffId}
            onChangeText={setStaffId}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.searchButton,
            searching && styles.searchButtonDisabled,
          ]}
          onPress={handleSearch}
          disabled={searching || !staffId.trim()}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {balance ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBalance(balance.userId)}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Staff Info */}
          <View style={styles.staffInfoCard}>
            <View style={styles.staffAvatar}>
              <Text style={styles.staffAvatarText}>
                {balance.User?.fullName?.charAt(0) ||
                  balance.userId.toString().charAt(0)}
              </Text>
            </View>
            <View>
              <Text style={styles.staffName}>
                {balance.User?.fullName || `کارمند #${balance.userId}`}
              </Text>
              <Text style={styles.staffYear}>
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />{" "}
                سال {balance.year}
              </Text>
            </View>
          </View>

          {/* Balance Items */}
          <View style={styles.balanceCard}>
            {renderBalanceItem(
              "calendar",
              "مرخصی سالانه",
              balance.usedAnnual,
              balance.annualLeave,
              balance.remainingAnnual,
              "#3b82f6",
              "#dbeafe",
            )}

            <View style={styles.divider} />

            {renderBalanceItem(
              "medkit",
              "مرخصی استعلاجی",
              balance.usedSick,
              balance.sickLeave,
              balance.remainingSick,
              "#10b981",
              "#d1fae5",
            )}

            <View style={styles.divider} />

            {renderBalanceItem(
              "alert-circle",
              "مرخصی اضطرار",
              balance.usedEmergency,
              balance.emergencyLeave,
              balance.remainingEmergency,
              "#f59e0b",
              "#fef3c7",
            )}

            <View style={styles.divider} />

            {renderBalanceItem(
              "heart",
              "مرخصی زایمان",
              balance.usedMaternity,
              balance.maternityLeave,
              balance.remainingMaternity,
              "#ef4444",
              "#fce4ec",
            )}
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>خلاصه</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>مجموع مرخصی</Text>
                <Text style={styles.summaryValue}>
                  {getTotalEntitled(balance)} روز
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>مصرف شده</Text>
                <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
                  {getTotalUsed(balance)} روز
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>باقیمانده</Text>
                <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                  {getTotalRemaining(balance)} روز
                </Text>
              </View>
            </View>

            <View style={styles.summaryProgress}>
              <View style={styles.summaryProgressBar}>
                <View
                  style={[
                    styles.summaryProgressFill,
                    {
                      width: `${getUsagePercentage(getTotalUsed(balance), getTotalEntitled(balance))}%`,
                      backgroundColor:
                        getTotalRemaining(balance) <
                        getTotalEntitled(balance) * 0.2
                          ? "#ef4444"
                          : "#8b5cf6",
                    },
                  ]}
                />
              </View>
              <Text style={styles.summaryProgressText}>
                {getUsagePercentage(
                  getTotalUsed(balance),
                  getTotalEntitled(balance),
                )}
                % استفاده شده
              </Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>جستجوی موجودی مرخصی</Text>
          <Text style={styles.emptyText}>
            شناسه کارمند را وارد کنید تا موجودی مرخصی او را مشاهده کنید
          </Text>
        </View>
      )}
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
  helpButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  searchButton: {
    backgroundColor: "#8b5cf6",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  staffInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  staffAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  staffAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffYear: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 2,
  },
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
  balanceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  balanceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceInfo: {
    flex: 1,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#f1f5f9",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
  },
  balanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  balanceRemaining: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  balanceRemainingLow: {
    color: "#ef4444",
    fontWeight: "600",
  },
  lowBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowBadgeText: {
    fontSize: 10,
    color: "#ef4444",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
    marginTop: 4,
  },
  summaryProgress: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  summaryProgressBar: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  summaryProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  summaryProgressText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 6,
    fontFamily: "Vazir",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
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
    textAlign: "center",
    fontFamily: "Vazir",
  },
});
