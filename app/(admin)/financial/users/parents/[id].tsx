import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ParentDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  occupation: string;
  address: string;
  emergencyContact: string;
  children: { id: number; name: string; className: string }[];
  createdAt: string;
}

export default function ParentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [parent, setParent] = useState<ParentDetail | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    relationship: "",
    occupation: "",
    address: "",
    emergencyContact: "",
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getUserById(parseInt(id));
      if (response.success && response.data) {
        const user = response.data;
        setParent({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
          relationship: user.parent?.relationship || "",
          occupation: user.parent?.occupation || "",
          address: user.parent?.address || "",
          emergencyContact: user.parent?.emergencyContact || "",
          children: user.parent?.children?.map((c: any) => ({
            id: c.id,
            name: c.name,
            className: c.className,
          })) || [],
          createdAt: user.createdAt,
        });
        setEditForm({
          fullName: user.fullName,
          phone: user.phone || "",
          relationship: user.parent?.relationship || "",
          occupation: user.parent?.occupation || "",
          address: user.parent?.address || "",
          emergencyContact: user.parent?.emergencyContact || "",
        });
      } else {
        Alert.alert("خطا", "والد یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading parent:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateUser(parseInt(id), {
        fullName: editForm.fullName,
        phone: editForm.phone || undefined,
      });

      Alert.alert("موفق", "اطلاعات والد با موفقیت بروزرسانی شد");
      setEditModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "بروزرسانی ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات والد" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!parent) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات والد" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>والد یافت نشد</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="جزئیات والد"
        showBack
        rightComponent={
          <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.editBtn}>
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{parent.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.parentName}>{parent.fullName}</Text>
          <Text style={styles.parentEmail}>{parent.email}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>تلفن:</Text>
              <Text style={styles.infoValue}>{parent.phone || "ثبت نشده"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>تاریخ عضویت:</Text>
              <Text style={styles.infoValue}>{new Date(parent.createdAt).toLocaleDateString("fa-IR")}</Text>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تکمیلی</Text>
          <View style={styles.infoCard}>
            {parent.relationship && (
              <View style={styles.infoRow}>
                <Ionicons name="people-circle-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>نسبت:</Text>
                <Text style={styles.infoValue}>{parent.relationship}</Text>
              </View>
            )}
            {parent.occupation && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>شغل:</Text>
                <Text style={styles.infoValue}>{parent.occupation}</Text>
              </View>
            )}
            {parent.emergencyContact && (
              <View style={styles.infoRow}>
                <Ionicons name="warning-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>تماس اضطراری:</Text>
                <Text style={styles.infoValue}>{parent.emergencyContact}</Text>
              </View>
            )}
            {parent.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoLabel}>آدرس:</Text>
                <Text style={styles.infoValue}>{parent.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Children Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فرزندان</Text>
          {parent.children.length === 0 ? (
            <View style={styles.emptyChildren}>
              <Ionicons name="people-outline" size={32} color={Colors.textSecondary} />
              <Text style={styles.emptyChildrenText}>هیچ فرزندی ثبت نشده است</Text>
              <TouchableOpacity
                style={styles.linkChildButton}
                onPress={() => router.push(`/(admin)/financial/parent-child?parentId=${parent.id}` as any)}
              >
                <Text style={styles.linkChildText}>اتصال فرزند</Text>
              </TouchableOpacity>
            </View>
          ) : (
            parent.children.map((child, index) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childCard,
                  index === parent.children.length - 1 && styles.childCardLast
                ]}
                onPress={() => router.push(`/(admin)/financial/fees/students/${child.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.childAvatar}>
                  <Text style={styles.childAvatarText}>{child.name.charAt(0)}</Text>
                </View>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childClass}>{child.className}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>ویرایش اطلاعات</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نام و نام خانوادگی</Text>
                <TextInput style={styles.formInput} value={editForm.fullName} onChangeText={(text) => setEditForm({ ...editForm, fullName: text })} textAlign="right" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>شماره تلفن</Text>
                <TextInput style={styles.formInput} value={editForm.phone} onChangeText={(text) => setEditForm({ ...editForm, phone: text })} keyboardType="phone-pad" textAlign="right" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نسبت با دانش‌آموز</Text>
                <TextInput style={styles.formInput} value={editForm.relationship} onChangeText={(text) => setEditForm({ ...editForm, relationship: text })} textAlign="right" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>شغل</Text>
                <TextInput style={styles.formInput} value={editForm.occupation} onChangeText={(text) => setEditForm({ ...editForm, occupation: text })} textAlign="right" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تماس اضطراری</Text>
                <TextInput style={styles.formInput} value={editForm.emergencyContact} onChangeText={(text) => setEditForm({ ...editForm, emergencyContact: text })} keyboardType="phone-pad" textAlign="right" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>آدرس</Text>
                <TextInput style={[styles.formInput, styles.textArea]} value={editForm.address} onChangeText={(text) => setEditForm({ ...editForm, address: text })} multiline numberOfLines={3} textAlignVertical="top" textAlign="right" />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveText}>ذخیره</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  errorText: { fontSize: 16, color: Colors.danger, marginTop: 12, fontFamily: "Vazirmatn" },
  retryButton: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },
  editBtn: { padding: 4 },

  profileHeader: { alignItems: "center", backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn" },
  parentName: { fontSize: 20, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  parentEmail: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  infoCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", width: 80, textAlign: "right" },
  infoValue: { flex: 1, fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },

  emptyChildren: { alignItems: "center", backgroundColor: Colors.card, borderRadius: 12, padding: 30 },
  emptyChildrenText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 8, marginBottom: 12 },
  linkChildButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: `${Colors.primary}15` },
  linkChildText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn" },

  childCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 8, gap: 12 },
  childCardLast: { marginBottom: 0 },
  childAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  childAvatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  childInfo: { flex: 1 },
  childName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  childClass: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },

  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6, textAlign: "right" },
  formInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: 15, fontWeight: "500", color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 15, fontWeight: "600", color: "white", fontFamily: "Vazirmatn" },
});