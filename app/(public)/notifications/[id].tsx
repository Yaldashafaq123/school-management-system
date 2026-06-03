import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  createdAt: string;
  publishedAt: string;
  eventDate?: string;
  eventLocation?: string;
  linkUrl?: string;
  isRead: boolean;
  isConfirmed?: boolean;
  requireConfirmation?: boolean;
  allowComments?: boolean;
  author: {
    fullName: string;
    role: string;
  };
  targetClasses?: { class: { name: string } }[];
  attachments?: { id: number; url: string; type: string; filename?: string }[];
  readBy?: { user: { fullName: string } }[];
  confirmedBy?: { user: { fullName: string; notes?: string } }[];
}

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    GENERAL: "megaphone",
    ASSIGNMENT: "document-text",
    EXAM: "clipboard",
    EVENT: "calendar",
    FEE: "cash",
    GRADE_RESULT: "school",
    PARENT_MEETING: "people",
    TIMETABLE: "time",
    HOLIDAY: "beach",
    WORKSHOP: "school",
  };
  return icons[type] || "notifications";
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    GENERAL: "اعلامیه عمومی",
    ASSIGNMENT: "کارخانگی",
    EXAM: "آزمون",
    EVENT: "رویداد",
    FEE: "فیس",
    GRADE_RESULT: "نتیجه امتحان",
    PARENT_MEETING: "جلسه اولیا",
    TIMETABLE: "برنامه هفتگی",
    HOLIDAY: "تعطیلی",
    WORKSHOP: "کارگاه آموزشی",
  };
  return labels[type] || "اعلامیه";
};

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    GENERAL: "#3B82F6",
    ASSIGNMENT: "#10B981",
    EXAM: "#F59E0B",
    EVENT: "#8B5CF6",
    FEE: "#EF4444",
    GRADE_RESULT: "#06B6D4",
    PARENT_MEETING: "#EC4899",
    TIMETABLE: "#14B8A6",
    HOLIDAY: "#F97316",
    WORKSHOP: "#A855F7",
  };
  return colors[type] || "#6B7280";
};

const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    LOW: "عادی",
    NORMAL: "متوسط",
    HIGH: "مهم",
    URGENT: "فوری",
  };
  return labels[priority] || priority;
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    LOW: "#6B7280",
    NORMAL: "#3B82F6",
    HIGH: "#F59E0B",
    URGENT: "#EF4444",
  };
  return colors[priority] || "#6B7280";
};

const formatFullDate = (date: string): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleDateString("fa-IR", options);
};

export default function AnnouncementDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncement = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `https://asraschools.cloud/api/announcements/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();

      if (result.success) {
        setAnnouncement(result.data);

        // Mark as read if not already
        if (!result.data.isRead) {
          await fetch(
            `https://asraschools.cloud/api/announcements/${id}/read`,
            {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }
      } else {
        Alert.alert("خطا", result.message || "اعلامیه یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading announcement:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اعلامیه پیش آمد");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `https://asraschools.cloud/api/announcements/${id}/confirm`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notes: confirmNotes }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert("موفقیت", "تاییدیه شما با موفقیت ثبت شد");
        setShowConfirmModal(false);
        setConfirmNotes("");
        loadAnnouncement();
      } else {
        Alert.alert("خطا", result.message || "خطا در ثبت تاییدیه");
      }
    } catch (error) {
      console.error("Error confirming:", error);
      Alert.alert("خطا", "مشکلی در ثبت تاییدیه پیش آمد");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenLink = () => {
    if (announcement?.linkUrl) {
      Linking.openURL(announcement.linkUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات اعلامیه" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!announcement) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات اعلامیه" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>اعلامیه یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = getTypeColor(announcement.type);
  const priorityColor = getPriorityColor(announcement.priority);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="جزئیات اعلامیه" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Badges */}
        <View style={styles.headerBadges}>
          <View
            style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}
          >
            <Ionicons
              name={getTypeIcon(announcement.type) as any}
              size={16}
              color={typeColor}
            />
            <Text style={[styles.typeText, { color: typeColor }]}>
              {getTypeLabel(announcement.type)}
            </Text>
          </View>

          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: `${priorityColor}20` },
            ]}
          >
            <Text style={[styles.priorityText, { color: priorityColor }]}>
              {getPriorityLabel(announcement.priority)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{announcement.title}</Text>

        {/* Author & Date */}
        <View style={styles.metaInfo}>
          <View style={styles.authorInfo}>
            <Ionicons
              name="person-circle"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.authorName}>
              {announcement.author.fullName}
            </Text>
            <View style={styles.authorRole}>
              <Text style={styles.authorRoleText}>
                {announcement.author.role === "ADMIN" && "مدیر سیستم"}
                {announcement.author.role === "TEACHER" && "معلم"}
                {announcement.author.role === "STUDENT" && "دانش‌آموز"}
                {announcement.author.role === "PARENT" && "والدین"}
              </Text>
            </View>
          </View>

          <Text style={styles.dateText}>
            {formatFullDate(announcement.publishedAt || announcement.createdAt)}
          </Text>
        </View>

        {/* Target Classes */}
        {announcement.targetClasses &&
          announcement.targetClasses.length > 0 && (
            <View style={styles.targetInfo}>
              <Ionicons name="school" size={16} color={Colors.textSecondary} />
              <Text style={styles.targetText}>
                مخاطبان:{" "}
                {announcement.targetClasses
                  .map((tc) => tc.class.name)
                  .join("، ")}
              </Text>
            </View>
          )}

        {/* Event Details (if applicable) */}
        {(announcement.eventDate || announcement.eventLocation) && (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>جزئیات رویداد</Text>
            {announcement.eventDate && (
              <View style={styles.eventRow}>
                <Ionicons name="calendar" size={18} color={typeColor} />
                <Text style={styles.eventText}>
                  {new Date(announcement.eventDate).toLocaleDateString("fa-IR")}
                </Text>
              </View>
            )}
            {announcement.eventLocation && (
              <View style={styles.eventRow}>
                <Ionicons name="location" size={18} color={typeColor} />
                <Text style={styles.eventText}>
                  {announcement.eventLocation}
                </Text>
              </View>
            )}
            {announcement.linkUrl && (
              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleOpenLink}
              >
                <Ionicons name="link" size={18} color={Colors.primary} />
                <Text style={styles.linkText}>لینک جلسه آنلاین</Text>
                <Ionicons
                  name="open-outline"
                  size={14}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        <View style={styles.contentCard}>
          <Text style={styles.contentText}>{announcement.content}</Text>
        </View>

        {/* Attachments */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.sectionTitle}>پیوست‌ها</Text>
            {announcement.attachments.map((attachment) => (
              <TouchableOpacity
                key={attachment.id}
                style={styles.attachmentItem}
                onPress={() => Linking.openURL(attachment.url)}
              >
                <Ionicons
                  name="document-attach"
                  size={20}
                  color={Colors.primary}
                />
                <Text style={styles.attachmentName}>
                  {attachment.filename || "فایل پیوست"}
                </Text>
                <Ionicons
                  name="download-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Confirmation Section (for parent meetings) */}
        {announcement.requireConfirmation && (
          <View style={styles.confirmationSection}>
            <Text style={styles.sectionTitle}>تایید حضور</Text>

            {announcement.isConfirmed ? (
              <View style={styles.confirmedCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.success}
                />
                <View style={styles.confirmedInfo}>
                  <Text style={styles.confirmedText}>
                    شما حضور خود را تایید کرده‌اید
                  </Text>
                  {announcement.confirmedBy &&
                    announcement.confirmedBy[0]?.notes && (
                      <Text style={styles.confirmedNotes}>
                        یادداشت: {announcement.confirmedBy[0].notes}
                      </Text>
                    )}
                </View>
              </View>
            ) : (
              <View style={styles.confirmPrompt}>
                <Text style={styles.confirmPromptText}>
                  لطفا حضور خود را برای این جلسه تایید کنید
                </Text>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setShowConfirmModal(true)}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>تایید حضور</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Statistics (for teachers/admins) */}
        {announcement.readBy && announcement.readBy.length > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>آمار مشاهده</Text>
            <View style={styles.statsCard}>
              <Text style={styles.statsCount}>
                {announcement.readBy.length} نفر این اعلامیه را مشاهده کرده‌اند
              </Text>
              <View style={styles.readersList}>
                {announcement.readBy.slice(0, 5).map((reader, index) => (
                  <Text key={index} style={styles.readerName}>
                    {reader.user.fullName}
                  </Text>
                ))}
                {announcement.readBy.length > 5 && (
                  <Text style={styles.moreReaders}>
                    و {announcement.readBy.length - 5} نفر دیگر...
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تایید حضور</Text>
              <TouchableOpacity onPress={() => setShowConfirmModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>
              آیا در {getTypeLabel(announcement.type)} حضور خواهید داشت؟
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="یادداشت (اختیاری)"
              placeholderTextColor={Colors.textSecondary}
              value={confirmNotes}
              onChangeText={setConfirmNotes}
              multiline
              numberOfLines={3}
              textAlign="right"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleConfirm}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmModalButtonText}>تایید حضور</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.danger,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerBadges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 32,
  },
  metaInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  authorRole: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  authorRoleText: {
    fontSize: 10,
    color: Colors.primary,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  targetInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  eventText: {
    fontSize: 14,
    color: Colors.text,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 10,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
  },
  contentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
    textAlign: "justify",
  },
  attachmentsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  confirmationSection: {
    marginBottom: 16,
  },
  confirmedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  confirmedInfo: {
    flex: 1,
  },
  confirmedText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: "500",
    marginBottom: 4,
  },
  confirmedNotes: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  confirmPrompt: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  confirmPromptText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statsSection: {
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsCount: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  readersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  readerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreReaders: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  cancelButtonText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: "500",
  },
  confirmModalButton: {
    backgroundColor: Colors.primary,
  },
  confirmModalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
