import {
  Bell,
  Calendar,
  Clock,
  Download,
  MapPin,
  Users,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SchoolEvents() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // دسته‌بندی‌ها
  const categories = [
    { id: "all", label: "تمام رویدادها" },
    { id: "academic", label: "تحصیلی" },
    { id: "sports", label: "ورزشی" },
    { id: "cultural", label: "فرهنگی" },
    { id: "parent", label: "والدین" },
  ];

  // رویدادها
  const events = [
    {
      id: 1,
      title: "روز ورزش سالانه",
      date: "2024-03-15",
      time: "۹:۰۰ صبح - ۳:۰۰ عصر",
      location: "زمین ورزش مکتب",
      category: "sports",
      description:
        "مسابقات ورزشی سالانه بین خانه‌ها با رشته‌های مختلف دو و میدانی.",
      rsvp: true,
      attending: 45,
      maxAttendees: 100,
    },
    {
      id: 2,
      title: "نشت والدین-معلمین",
      date: "2024-03-20",
      time: "۲:۰۰ عصر - ۵:۰۰ عصر",
      location: "آودیتوریوم اصلی",
      category: "parent",
      description:
        "پیشرفت فرزند خود را با معلمین بحث کنید. زمان‌ها تعیین خواهند شد.",
      rsvp: true,
      attending: 78,
      maxAttendees: 120,
    },
    {
      id: 3,
      title: "نمایشگاه ساینس",
      date: "2024-03-25",
      time: "۱۰:۰۰ صبح - ۴:۰۰ عصر",
      location: "بلوک ساینس",
      category: "academic",
      description:
        "پروژه‌های محصلین که نوآوری‌ها و تجارب علمی را نمایش می‌دهند.",
      rsvp: false,
      attending: 0,
      maxAttendees: 0,
    },
    {
      id: 4,
      title: "جشن فرهنگی",
      date: "2024-04-05",
      time: "۶:۰۰ عصر - ۹:۰۰ شب",
      location: "آمفی تیاتر مکتب",
      category: "cultural",
      description: "جشن فرهنگی سالانه با اجراهای موسیقی، رقص و نمایش.",
      rsvp: true,
      attending: 92,
      maxAttendees: 150,
    },
  ];

  const filteredEvents =
    selectedCategory === "all"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* سربرگ */}
      <View style={styles.header}>
        <Calendar size={32} color="#3b82f6" />
        <Text style={styles.title}>رویدادهای مکتب</Text>
        <Text style={styles.subtitle}>از فعالیت‌های مکتب مطلع باشید</Text>
      </View>

      {/* فیلتر دسته‌بندی */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPill,
              selectedCategory === category.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* لیست رویدادها */}
      <View style={styles.eventsList}>
        {filteredEvents.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            {/* نشان تاریخ */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateDay}>
                {new Date(event.date).getDate()}
              </Text>
              <Text style={styles.dateMonth}>
                {new Date(event.date).toLocaleDateString("fa-IR", {
                  month: "short",
                })}
              </Text>
            </View>

            {/* جزئیات رویداد */}
            <View style={styles.eventDetails}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View
                  style={[
                    styles.categoryTag,
                    { backgroundColor: getCategoryColor(event.category) },
                  ]}
                >
                  <Text style={styles.categoryTagText}>
                    {getCategoryLabel(event.category)}
                  </Text>
                </View>
              </View>

              <View style={styles.eventMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{event.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin size={16} color="#6b7280" />
                  <Text style={styles.metaText}>{event.location}</Text>
                </View>
              </View>

              <Text style={styles.eventDescription}>{event.description}</Text>

              {/* بخش تایید حضور */}
              {event.rsvp && (
                <View style={styles.rsvpSection}>
                  <View style={styles.attendanceBar}>
                    <View
                      style={[
                        styles.attendanceFill,
                        {
                          width: `${(event.attending / event.maxAttendees) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.attendanceInfo}>
                    <View style={styles.attendanceText}>
                      <Users size={16} color="#6b7280" />
                      <Text style={styles.attendanceCount}>
                        {event.attending}/{event.maxAttendees} نفر حاضر خواهند
                        شد
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.rsvpButton}>
                      <Text style={styles.rsvpButtonText}>تایید حضور</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* اقدامات */}
              <View style={styles.eventActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Bell size={20} color="#3b82f6" />
                  <Text style={styles.actionText}>یادآوری</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Download size={20} color="#10b981" />
                  <Text style={styles.actionText}>افزودن به تقویم</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* خلاصه رویدادهای آینده */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>خلاصه رویدادهای آینده</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Text style={styles.statNumber}>{filteredEvents.length}</Text>
            <Text style={styles.statLabel}>تعداد کل رویدادها</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.statNumber}>
              {filteredEvents.filter((e) => e.rsvp).length}
            </Text>
            <Text style={styles.statLabel}>نیازمند تایید</Text>
          </View>
          <View style={styles.summaryStat}>
            <Text style={styles.statNumber}>
              {
                filteredEvents.filter((e) => new Date(e.date) > new Date())
                  .length
              }
            </Text>
            <Text style={styles.statLabel}>رویدادهای آینده</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// تابع برای گرفتن برچسب دسته‌بندی به دری
function getCategoryLabel(category: string) {
  switch (category) {
    case "academic":
      return "تحصیلی";
    case "sports":
      return "ورزشی";
    case "cultural":
      return "فرهنگی";
    case "parent":
      return "والدین";
    default:
      return category;
  }
}

// تابع برای گرفتن رنگ دسته‌بندی
function getCategoryColor(category: string) {
  switch (category) {
    case "academic":
      return "#3b82f620";
    case "sports":
      return "#10b98120";
    case "cultural":
      return "#8b5cf620";
    case "parent":
      return "#f59e0b20";
    default:
      return "#e5e7eb";
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    textAlign: "center", // راست‌چین برای دری
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center", // راست‌چین برای دری
  },
  categoryContainer: { paddingHorizontal: 16, backgroundColor: "white" },
  categoryContent: { paddingVertical: 16, gap: 8 },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  selectedCategory: { backgroundColor: "#3b82f6" },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center", // راست‌چین برای دری
  },
  selectedCategoryText: { color: "white" },
  eventsList: { padding: 16, gap: 16 },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dateBadge: {
    width: 80,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dateDay: { fontSize: 32, fontWeight: "700", color: "#111827" },
  dateMonth: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center", // راست‌چین برای دری
  },
  eventDetails: { flex: 1, padding: 16, gap: 12 },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  eventTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right", // راست‌چین برای دری
  },
  categoryTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center", // راست‌چین برای دری
  },
  eventMeta: { gap: 8 },
  metaItem: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-end", // تراز راست
  },
  metaText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right", // راست‌چین برای دری
  },
  eventDescription: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    textAlign: "right", // راست‌چین برای دری
  },
  rsvpSection: { gap: 12 },
  attendanceBar: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 3,
    overflow: "hidden",
  },
  attendanceFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  attendanceInfo: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceText: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    alignItems: "center",
    gap: 6,
  },
  attendanceCount: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right", // راست‌چین برای دری
  },
  rsvpButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  rsvpButtonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center", // راست‌چین برای دری
  },
  eventActions: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionButton: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "right", // راست‌چین برای دری
  },
  summaryCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 24,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row-reverse", // تغییر جهت برای دری
    justifyContent: "space-between",
  },
  summaryStat: { alignItems: "center", gap: 4 },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#111827" },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center", // راست‌چین برای دری
  },
});
