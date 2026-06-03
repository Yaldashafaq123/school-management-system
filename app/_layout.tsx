// app/_layout.tsx (simplified version)
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { I18nManager } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

// Enable RTL for Farsi
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

function RootLayoutNav() {
  const { isAuthenticated, user, isInitialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    // If not authenticated and not in auth group, redirect to login
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }

    // If authenticated and in auth group, redirect to appropriate dashboard
    if (isAuthenticated && inAuthGroup && user) {
      switch (user.role) {
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
      }
    }
  }, [isAuthenticated, user, isInitialized, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
