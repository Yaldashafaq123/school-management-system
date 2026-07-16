// app/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
// Enable RTL for Farsi
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// =============================
// UPDATE CHECKER COMPONENT
// =============================
interface VersionInfo {
  updateAvailable: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  versionCode: number;
  releaseNotes?: string;
  downloadUrl?: string;
  minSupportedVersion?: number;
  message?: string;
}

function UpdateChecker({ children }: { children: React.ReactNode }) {
  const [isChecking, setIsChecking] = useState(true);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [showForceUpdate, setShowForceUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentVersion = () => {
    const version = Constants.expoConfig?.version || "1.0.0";
    const versionCode = Application.nativeBuildVersion || "1";
    return {
      version,
      versionCode: parseInt(versionCode, 10),
    };
  };

  const getStoreUrl = () => {
    if (Platform.OS === "ios") {
      // Replace with your App Store ID
      return "https://apps.apple.com/app/idYOUR_APP_ID";
    } else {
      // Replace with your Play Store package name
      return "https://play.google.com/store/apps/details?id=com.your.app";
    }
  };

  const openStore = (customUrl?: string) => {
    const storeUrl = customUrl || getStoreUrl();
    Linking.openURL(storeUrl).catch((err) => {
      console.error("Failed to open store:", err);
      Alert.alert("خطا", "نمی‌توان فروشگاه را باز کرد. لطفا دستی اقدام کنید.");
    });
  };

  const checkForUpdates = async (): Promise<VersionInfo | null> => {
    try {
      const currentVersion = getCurrentVersion();
      const platform = Platform.OS === "ios" ? "IOS" : "ANDROID";

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/versions/check?platform=${platform}&currentVersion=${currentVersion.versionCode}`,
      );

      const result = await response.json();

      if (result.success && result.data.updateAvailable) {
        setUpdateInfo(result.data);

        // Store update info
        await AsyncStorage.setItem(
          "pending_update",
          JSON.stringify(result.data),
        );

        // If force update, show modal
        if (result.data.forceUpdate) {
          setShowForceUpdate(true);
        }

        return result.data;
      }

      return null;
    } catch (error) {
      console.error("Error checking for updates:", error);
      return null;
    }
  };

  const checkPendingUpdate = async () => {
    try {
      const pendingUpdate = await AsyncStorage.getItem("pending_update");
      const dismissedVersion = await AsyncStorage.getItem(
        "update_dismissed_version",
      );
      const currentVersion = getCurrentVersion();

      if (pendingUpdate) {
        const update = JSON.parse(pendingUpdate);

        // If version is different from dismissed version and newer than current, show update
        if (
          dismissedVersion !== update.versionCode.toString() &&
          currentVersion.versionCode < update.versionCode
        ) {
          setUpdateInfo(update);

          if (update.forceUpdate) {
            setShowForceUpdate(true);
          } else {
            // Show optional update alert
            Alert.alert(
              "به‌روزرسانی جدید",
              update.message ||
                `نسخه جدید ${update.latestVersion} منتشر شده است.\n\n${update.releaseNotes || ""}`,
              [
                {
                  text: "بعداً",
                  style: "cancel",
                  onPress: () => {
                    AsyncStorage.setItem(
                      "update_dismissed_version",
                      update.versionCode.toString(),
                    );
                  },
                },
                {
                  text: "بروزرسانی",
                  onPress: () => openStore(update.downloadUrl),
                },
              ],
            );
          }
        }
      }
    } catch (error) {
      console.error("Error checking pending update:", error);
    }
  };

  useEffect(() => {
    const initializeUpdateCheck = async () => {
      setIsChecking(true);
      await checkForUpdates();
      await checkPendingUpdate();
      setIsChecking(false);
      setIsLoading(false);
    };

    initializeUpdateCheck();
  }, []);

  // Periodic update check (every 24 hours)
  useEffect(() => {
    const interval = setInterval(
      async () => {
        if (!showForceUpdate) {
          await checkForUpdates();
        }
      },
      24 * 60 * 60 * 1000,
    ); // 24 hours

    return () => clearInterval(interval);
  }, [showForceUpdate]);

  const handleForceUpdate = () => {
    openStore(updateInfo?.downloadUrl);
  };

  if (isLoading || isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <>
      {children}

      {/* Force Update Modal */}
      {updateInfo && showForceUpdate && (
        <Modal
          visible={showForceUpdate}
          transparent={true}
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {}}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-download" size={48} color="#4285F4" />
              </View>

              <Text style={styles.modalTitle}>به‌روزرسانی اجباری</Text>
              <Text style={styles.modalVersion}>
                نسخه {updateInfo.latestVersion}
              </Text>

              <Text style={styles.modalMessage}>
                {updateInfo.message ||
                  "نسخه جدیدی از برنامه منتشر شده است. برای ادامه استفاده، لطفا برنامه را به‌روزرسانی کنید."}
              </Text>

              {updateInfo.releaseNotes && (
                <View style={styles.releaseNotesContainer}>
                  <Text style={styles.releaseNotesTitle}>تغییرات جدید:</Text>
                  <Text style={styles.releaseNotes}>
                    {updateInfo.releaseNotes}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleForceUpdate}
              >
                <Text style={styles.updateButtonText}>بروزرسانی</Text>
              </TouchableOpacity>

              <Text style={styles.hintText}>
                پس از به‌روزرسانی، برنامه به‌طور خودکار اجرا خواهد شد
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

// =============================
// ROOT LAYOUT NAVIGATION
// =============================
function RootLayoutNav() {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!segments?.length) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace("/(auth)/login");
      return;
    }

    if (isAuthenticated && inAuthGroup && user) {
      const role = user.role?.toLowerCase();

      switch (role) {
        case "student":
          router.replace("/(student)/(tabs)");
          break;
        case "teacher":
          router.replace("/(teacher)/(tabs)");
          break;
        case "admin":
          router.replace("/(admin)/(tabs)");
          break;
        case "parent":
          router.replace("/(parent)/(tabs)");
          break;
        case "finance":
          // cast to any to satisfy router.replace typing for nested group path
          router.replace("/(finance)/(tabs)" as unknown as any);
          break;
        case "hr": // ✅ NEW
          router.replace("/(hr)/(tabs)" as unknown as any);
          break;
        case "principal": // ✅ NEW
          router.replace("/(principal)/(tabs)" as unknown as any);
          break;
        default:
          router.replace("/(auth)/login");
      }
    }
  }, [isAuthenticated, user, isInitialized]);

  return <Slot />;
}

// =============================
// MAIN EXPORT
// =============================
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UpdateChecker>
          <RootLayoutNav />
        </UpdateChecker>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

// =============================
// STYLES
// =============================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F0FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  modalVersion: {
    fontSize: 16,
    color: "#4285F4",
    marginBottom: 16,
    fontWeight: "600",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  releaseNotesContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  releaseNotesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  releaseNotes: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  updateButton: {
    backgroundColor: "#4285F4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hintText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});
