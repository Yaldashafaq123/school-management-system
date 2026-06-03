// app/certificates/index.tsx - COMING SOON VERSION

import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CertificatesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گواهینامه‌ها" showBack onBackPress={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="trophy" size={80} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>گواهینامه‌های شما</Text>
          <Text style={styles.heroSubtitle}>
            به زودی قادر به دریافت گواهینامه‌های دوره‌های تکمیل شده خواهید بود
          </Text>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <View style={styles.comingSoonHeader}>
            <View style={styles.comingSoonIcon}>
              <Ionicons
                name="construct-outline"
                size={32}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.comingSoonTitle}>در حال توسعه</Text>
          </View>

          <Text style={styles.comingSoonText}>
            سیستم صدور گواهینامه در حال آماده‌سازی است. به زودی می‌توانید پس از
            تکمیل دوره‌ها، گواهینامه‌های معتبر خود را دریافت و به اشتراک
            بگذارید.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.featureText}>
                دریافت گواهینامه پس از تکمیل دوره
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.featureText}>بارگذاری خودکار گواهینامه</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.featureText}>
                اشتراک‌گذاری در شبکه‌های اجتماعی
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.featureText}>
                تأیید اعتبار آنلاین گواهینامه
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text style={styles.featureText}>
                دریافت گواهینامه به صورت PDF
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>نحوه دریافت گواهینامه</Text>

          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۱</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>تکمیل دوره</Text>
                <Text style={styles.stepDescription}>
                  تمامی ویدیوها، تمرینات و آزمون‌های دوره را با موفقیت پشت سر
                  بگذارید
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۲</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>کسب نمره قبولی</Text>
                <Text style={styles.stepDescription}>
                  حداقل نمره ۶۰٪ را در آزمون نهایی دوره کسب کنید
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۳</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>دریافت خودکار گواهینامه</Text>
                <Text style={styles.stepDescription}>
                  گواهینامه شما به طور خودکار صادر و در این بخش قرار می‌گیرد
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۴</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>اشتراک‌گذاری</Text>
                <Text style={styles.stepDescription}>
                  گواهینامه خود را در شبکه‌های اجتماعی یا رزومه خود به اشتراک
                  بگذارید
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sample Preview */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>پیش‌نمایش گواهینامه</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="school" size={32} color={Colors.primary} />
              <Text style={styles.previewTitle}>آموزش فارسی</Text>
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.previewText}>این گواهینامه به</Text>
              <Text style={styles.previewName}>نام دانش آموز</Text>
              <Text style={styles.previewText}>به دلیل</Text>
              <Text style={styles.previewCourse}>تکمیل موفقیت‌آمیز دوره</Text>
              <Text style={styles.courseName}>نام دوره آموزشی</Text>
              <Text style={styles.previewText}>اعطا می‌گردد.</Text>
            </View>
            <View style={styles.previewFooter}>
              <View style={styles.signature}>
                <Text style={styles.signatureLabel}>امضاء</Text>
                <View style={styles.signatureLine} />
              </View>
              <View style={styles.seal}>
                <Ionicons
                  name="copy-outline"
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.sealText}>مهر رسمی</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Button */}
        <TouchableOpacity style={styles.notifyButton}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <Text style={styles.notifyButtonText}>به من اطلاع بده</Text>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <Text style={styles.infoNoteText}>
            گواهینامه‌های صادره دارای کد یکتا و قابلیت تأیید آنلاین می‌باشند.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  comingSoonCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comingSoonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  comingSoonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  comingSoonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  progressSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  stepsContainer: {
    gap: 20,
  },
  step: {
    flexDirection: "row",
    gap: 14,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  previewSection: {
    marginBottom: 24,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: "hidden",
    padding: 20,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.primary,
  },
  previewBody: {
    alignItems: "center",
    marginBottom: 24,
  },
  previewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  previewName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 8,
  },
  previewCourse: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: 8,
  },
  previewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  signature: {
    alignItems: "center",
  },
  signatureLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  signatureLine: {
    width: 80,
    height: 1,
    backgroundColor: Colors.border,
  },
  seal: {
    alignItems: "center",
  },
  sealText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  infoNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 32,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
