// app/(admin)/financial/settings/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const SETTINGS_SECTIONS = [
  {
    title: "تنظیمات پایه",
    items: [
      {
        id: "academic-years",
        title: "سال‌های تعلیمی",
        subtitle: "مدیریت سال‌های تحصیلی",
        icon: "calendar-outline",
        color: "#3b82f6",
        route: "/financial/settings/academic-years",
      },
      {
        id: "fee-categories",
        title: "دسته‌بندی فیس",
        subtitle: "انواع فیص و شهریه",
        icon: "pricetags-outline",
        color: "#8b5cf6",
        route: "/financial/settings/fee-categories",
      },
    ],
  },
  {
    title: "تنظیمات پرداخت",
    items: [
      {
        id: "payment-methods",
        title: "روش‌های پرداخت",
        subtitle: "مدیریت روش‌های پرداخت",
        icon: "card-outline",
        color: "#10b981",
        route: null,
      },
      {
        id: "default-currency",
        title: "واحد پول",
        subtitle: "افغانی (AFN)",
        icon: "cash-outline",
        color: "#f59e0b",
        route: null,
      },
    ],
  },
  {
    title: "تنظیمات اعلان‌ها",
    items: [
      {
        id: "notifications",
        title: "اعلان‌های پرداخت",
        subtitle: "یادآوری پرداخت به والدین",
        icon: "notifications-outline",
        color: "#ef4444",
        route: null,
        hasSwitch: true,
      },
      {
        id: "auto-reminders",
        title: "یادآوری خودکار",
        subtitle: "ارسال خودکار پیام معوقه",
        icon: "alarm-outline",
        color: "#ec4899",
        route: null,
        hasSwitch: true,
      },
    ],
  },
  {
    title: "سایر",
    items: [
      {
        id: "backup",
        title: "پشتیبان‌گیری",
        subtitle: "ذخیره اطلاعات مالی",
        icon: "cloud-upload-outline",
        color: "#06b6d4",
        route: null,
      },
      {
        id: "export-settings",
        title: "تنظیمات صدور",
        subtitle: "فرمت و نوع راپور",
        icon: "settings-outline",
        color: "#64748b",
        route: null,
      },
      {
        id: "about",
        title: "درباره سیستم",
        subtitle: "نسخه ۱.۰.۰",
        icon: "information-circle-outline",
        color: "#94a3b8",
        route: null,
      },
    ],
  },
];

export default function FinanceSettingsScreen() {
  const router = useRouter();
  const [switches, setSwitches] = React.useState<Record<string, boolean>>({
    notifications: true,
    "auto-reminders": false,
  });

  const handleToggle = (id: string) => {
    setSwitches(prev => ({ ...prev, [id]: !prev[id] }));
    Alert.alert("تنظیمات", "تنظیمات با موفقیت ذخیره شد");
  };

  const handlePress = (item: any) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (!item.hasSwitch) {
      Alert.alert("اطلاعات", "این بخش به زودی فعال می‌شود");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>تنظیمات مالی</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={["#64748b", "#475569"]}
            style={styles.heroGradient}
          >
            <Ionicons name="settings" size={40} color="#fff" />
            <Text style={styles.heroTitle}>تنظیمات سیستم مالی</Text>
            <Text style={styles.heroSubtitle}>
              پیکربندی و مدیریت تنظیمات
            </Text>
          </LinearGradient>
        </View>

        {/* Settings Sections */}
        {SETTINGS_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={() => handlePress(item)}
                  activeOpacity={item.route || item.hasSwitch ? 0.7 : 1}
                >
                  <View style={[styles.settingIcon, { backgroundColor: item.color + "15" }]}>
                    <Ionicons name={item.icon as any} size={22} color={item.color} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingName}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                  {item.hasSwitch ? (
                    <Switch
                      value={switches[item.id]}
                      onValueChange={() => handleToggle(item.id)}
                      trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
                      thumbColor={switches[item.id] ? "#3b82f6" : "#94a3b8"}
                    />
                  ) : (
                    <Ionicons
                      name={item.route ? "chevron-forward" : "lock-closed-outline"}
                      size={18}
                      color="#94a3b8"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* System Info */}
        <View style={styles.systemInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#94a3b8" />
          <Text style={styles.systemText}>
            سیستم مدیریت مالی مکتب | نسخه ۱.۰.۰
          </Text>
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

  // Hero
  heroCard: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  heroGradient: {
    padding: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
    fontFamily: "VazirBold",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  // Sections
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    paddingHorizontal: 16,
    marginBottom: 8,
    fontFamily: "VazirBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionCard: {
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },

  // System Info
  systemInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 6,
  },
  systemText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});