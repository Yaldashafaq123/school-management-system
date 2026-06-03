// hooks/useAppUpdate.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import Constants from "expo-constants";
import { useState } from "react";
import { Alert, Linking, Platform } from "react-native";

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

export const useAppUpdate = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);

  const getCurrentVersion = () => {
    // Get version from app config
    const version = Constants.expoConfig?.version || "1.0.0";
    const versionCode = Application.nativeBuildVersion || "1";
    return {
      version,
      versionCode: parseInt(versionCode, 10),
    };
  };

  const checkForUpdates = async (showNoUpdateMessage = false) => {
    try {
      setIsChecking(true);

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

        // Show update dialog
        showUpdateDialog(result.data);
      } else if (showNoUpdateMessage) {
        Alert.alert("اطلاعیه", "شما از آخرین نسخه استفاده می‌کنید.");
      }

      return result.data;
    } catch (error) {
      console.error("Error checking for updates:", error);
      if (showNoUpdateMessage) {
        Alert.alert("خطا", "مشکلی در بررسی به‌روزرسانی پیش آمد.");
      }
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const showUpdateDialog = (info: VersionInfo) => {
    const updateMessage =
      info.message ||
      `نسخه جدید ${info.latestVersion} منتشر شده است.\n\n${info.releaseNotes || ""}`;

    if (info.forceUpdate) {
      // Force update - user must update to continue
      Alert.alert(
        "به‌روزرسانی اجباری",
        updateMessage,
        [
          {
            text: "بروزرسانی",
            onPress: () => openStore(info.downloadUrl),
          },
        ],
        { cancelable: false },
      );
    } else {
      // Optional update
      Alert.alert("به‌روزرسانی جدید", updateMessage, [
        {
          text: "بعداً",
          style: "cancel",
          onPress: () => {
            // Store that user dismissed update
            AsyncStorage.setItem(
              "update_dismissed_version",
              info.versionCode.toString(),
            );
          },
        },
        {
          text: "بروزرسانی",
          onPress: () => openStore(info.downloadUrl),
        },
      ]);
    }
  };

  const openStore = (customUrl?: string) => {
    const storeUrl = customUrl || getStoreUrl();
    Linking.openURL(storeUrl).catch((err) => {
      console.error("Failed to open store:", err);
      Alert.alert("خطا", "نمی‌توان فروشگاه را باز کرد. لطفا دستی اقدام کنید.");
    });
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

  const checkPendingUpdate = async () => {
    try {
      const pendingUpdate = await AsyncStorage.getItem("pending_update");
      const dismissedVersion = await AsyncStorage.getItem(
        "update_dismissed_version",
      );

      if (pendingUpdate) {
        const update = JSON.parse(pendingUpdate);
        const currentVersion = getCurrentVersion();

        // If version is different from dismissed version, show update again
        if (
          dismissedVersion !== update.versionCode.toString() &&
          currentVersion.versionCode < update.versionCode
        ) {
          showUpdateDialog(update);
        }
      }
    } catch (error) {
      console.error("Error checking pending update:", error);
    }
  };

  return {
    checkForUpdates,
    checkPendingUpdate,
    isChecking,
    updateInfo,
  };
};
