// app/(admin)/financial/payments/[id].tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/src/config/financeApi";

export default function PaymentReceiptScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `رسید پرداخت\nشماره: ${id}\nتاریخ: ${new Date().toLocaleDateString("fa-AF")}`,
        title: "رسید پرداخت",
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>رسید پرداخت</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Success Banner */}
          <View style={styles.successBanner}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color="#10b981" />
            </View>
            <Text style={styles.successText}>پرداخت موفق</Text>
            <Text style={styles.successAmount}>
              {formatCurrency(2500)}
            </Text>
          </View>

          {/* Receipt Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>شماره رسید</Text>
              <Text style={styles.detailValue}>#{id}</Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>شاگرد</Text>
              <Text style={styles.detailValue}>احمد محمدی</Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>صنف</Text>
              <Text style={styles.detailValue}>صنف ۸ - A</Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>عنوان فیس</Text>
              <Text style={styles.detailValue}>شهریه ماهانه - حمل ۱۴۰۳</Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>مبلغ</Text>
              <Text style={[styles.detailValue, styles.detailAmount]}>
                {formatCurrency(2500)}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>روش پرداخت</Text>
              <View style={styles.methodBadge}>
                <Ionicons name="cash-outline" size={14} color="#059669" />
                <Text style={styles.methodText}>نقدی</Text>
              </View>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تاریخ</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleDateString("fa-AF", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ساعت</Text>
              <Text style={styles.detailValue}>
                {new Date().toLocaleTimeString("fa-AF", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            <View style={styles.detailDivider} />
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تایید کننده</Text>
              <Text style={styles.detailValue}>محمد کریمی</Text>
            </View>
          </View>

          {/* Reference Number */}
          <View style={styles.referenceSection}>
            <Ionicons name="document-text-outline" size={18} color="#64748b" />
            <Text style={styles.referenceText}>شماره مرجع: REF-2024-001</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#3b82f6" />
            <Text style={styles.actionText}>اشتراک‌گذاری</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/financial/payments/record")}
          >
            <Ionicons name="add-circle-outline" size={20} color="#10b981" />
            <Text style={styles.actionText}>پرداخت جدید</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Ionicons name="list-outline" size={20} color="#64748b" />
            <Text style={styles.actionText}>تاریخچه</Text>
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
  receiptCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  successBanner: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1,
    borderBottomColor: "#bbf7d0",
  },
  successIcon: {
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "Vazir",
  },
  successAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "#059669",
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  detailsSection: {
    padding: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  detailAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
    fontFamily: "VazirBold",
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
  methodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  methodText: {
    fontSize: 13,
    color: "#059669",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  referenceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 6,
  },
  referenceText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  actionsSection: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
});