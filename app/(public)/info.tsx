// app/(tabs)/contact-info.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { useRouter } from "expo-router";
import {
  Alert,
  Clipboard,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ContactItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
  color: string;
}

export default function ContactInfo() {
  const router = useRouter();

  // App version and build info
  const appVersion = Application.nativeApplicationVersion || "1.0.0";
  const buildNumber = Application.nativeBuildVersion || "1";
  const deviceModel = Device.modelName || "Unknown Device";
  const osVersion = Platform.OS === "ios" ? Device.osVersion : Device.osVersion;

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert("کپی شد", `${label} در کلیپ‌بورد کپی شد`);
  };

  const openWhatsApp = () => {
    const phoneNumber = "+93744726109"; // Replace with your WhatsApp number
    const message = "Hello! I need support regarding your app.";
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(
            `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
          );
        }
      })
      .catch((err) => {
        Alert.alert(
          "خطا",
          "نمی‌توان واتساپ را باز کرد. لطفا مطمئن شوید واتساپ نصب شده است.",
        );
      });
  };

  const openEmail = () => {
    const email = "Yaldashafaq2424@gmail.com"; // Replace with your email
    const subject = "App Support Request";
    const body = `
App Information:
- Version: ${appVersion}
- Build: ${buildNumber}
- Platform: ${Platform.OS}
- Device: ${deviceModel}
- OS Version: ${osVersion}

Please describe your issue below:
`;

    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url).catch(() => {
      Alert.alert(
        "خطا",
        "نمی‌توان ایمیل را باز کرد. لطفا از ایمیل کلاینت دیگری استفاده کنید.",
      );
    });
  };

  const openTelegram = () => {
    const username = "Yalda_Shafaq"; // Replace with your Telegram username
    const url = `tg://resolve?domain=${username}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://t.me/${username}`);
        }
      })
      .catch(() => {
        Alert.alert(
          "خطا",
          "نمی‌توان تلگرام را باز کرد. لطفا مطمئن شوید تلگرام نصب شده است.",
        );
      });
  };

  const openWebsite = () => {
    const url = "https://www.hoshmandasra.edu.af/"; // Replace with your website
    Linking.openURL(url).catch(() => {
      Alert.alert("خطا", "نمی‌توان وبسایت را باز کرد.");
    });
  };

  const contactItems: ContactItem[] = [
    {
      id: "whatsapp",
      title: "واتساپ",
      subtitle: "برای پشتیبانی سریع",
      icon: "logo-whatsapp",
      action: openWhatsApp,
      color: "#25D366",
    },
    {
      id: "email",
      title: "ایمیل پشتیبانی",
      subtitle: "Yaldashafaq2424@gmail.com",
      icon: "mail",
      action: openEmail,
      color: "#EA4335",
    },
    {
      id: "telegram",
      title: "تلگرام",
      subtitle: "@Yalda_Shafaq",
      icon: "paper-plane",
      action: openTelegram,
      color: "#0088cc",
    },
    {
      id: "website",
      title: "وبسایت",
      subtitle: "hoshmandasra.edu.af",
      icon: "globe",
      action: openWebsite,
      color: "#4285F4",
    },
    {
      id: "phone",
      title: "تماس تلفنی",
      subtitle: "+93744726109",
      icon: "call",
      action: () => {
        Linking.openURL("tel:+93744726109").catch(() => {
          Alert.alert("خطا", "نمی‌توان شماره را گرفت.");
        });
      },
      color: "#34A853",
    },
  ];

  const appInfoItems = [
    {
      label: "نسخه اپلیکیشن",
      value: appVersion,
    },
    {
      label: "شماره بیلد",
      value: buildNumber,
    },
    {
      label: "پلتفرم",
      value: Platform.OS.toUpperCase(),
    },
    {
      label: "مدل دستگاه",
      value: deviceModel,
    },
    {
      label: "نسخه سیستم عامل",
      value: osVersion,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تماس با ما</Text>
        <View style={styles.headerPlaceholder} />
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="help-circle" size={64} color="#4285F4" />
          </View>
          <Text style={styles.heroTitle}>نیاز به کمک دارید؟</Text>
          <Text style={styles.heroSubtitle}>
            ما اینجا هستیم تا به شما کمک کنیم. لطفا از طریق یکی از روش‌های زیر
            با ما تماس بگیرید.
          </Text>
        </View>

        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>روش‌های ارتباطی</Text>
          {contactItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.contactCard}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: item.color + "20" },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>{item.title}</Text>
                <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات اپلیکیشن</Text>
          <View style={styles.infoCard}>
            {appInfoItems.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.infoRow,
                  index < appInfoItems.length - 1 && styles.infoRowBorder,
                ]}
              >
                <Text style={styles.infoLabel}>{item.label}</Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(item.value, item.label)}
                >
                  <Text style={styles.infoValue}>{item.value}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <Text style={styles.infoHint}>
            در صورت بروز مشکل، لطفا این اطلاعات را برای پشتیبانی ارسال کنید.
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سوالات متداول</Text>
          <View style={styles.faqCard}>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                چگونه حساب کاربری ایجاد کنم؟
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                رمز عبور خود را فراموش کرده‌ام
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ساعت کاری پشتیبانی</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>شنبه تا چهارشنبه</Text>
              <Text style={styles.hoursTime}>۹:۰۰ صبح - ۱۷:۰۰ عصر</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>پنجشنبه</Text>
              <Text style={styles.hoursTime}>۹:۰۰ صبح - ۱۳:۰۰ عصر</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>جمعه</Text>
              <Text style={styles.hoursTime}>تعطیل</Text>
            </View>
          </View>
        </View>

        {/* Response Time */}
        <View style={styles.responseTimeCard}>
          <Ionicons name="time" size={24} color="#4285F4" />
          <View style={styles.responseTimeInfo}>
            <Text style={styles.responseTimeTitle}>زمان پاسخگویی</Text>
            <Text style={styles.responseTimeText}>
              تلاش می‌کنیم در کوتاه‌ترین زمان ممکن پاسخگوی شما باشیم. معمولا در
              کمتر از ۲۴ ساعت پاسخ می‌دهیم.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Web Studio. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f0f7ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  infoHint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  faqItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  faqQuestion: {
    fontSize: 14,
    color: "#000",
    flex: 1,
    marginRight: 12,
  },
  hoursCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
  },
  hoursRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hoursDay: {
    fontSize: 14,
    color: "#666",
  },
  hoursTime: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
  responseTimeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f7ff",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4285F4",
  },
  responseTimeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  responseTimeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4285F4",
    marginBottom: 4,
  },
  responseTimeText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
