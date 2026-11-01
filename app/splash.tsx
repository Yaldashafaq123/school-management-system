/* eslint-disable react-hooks/refs */
// app/splash.tsx
// Splash + intro carousel for Asra Private High School SMS
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// ==========================================================
// TYPES
// ==========================================================
interface IntroSlide {
  id: string;
  icon: string;
  color: string;
  gradient: [string, string];
  title: string;
  subtitle: string;
  features: string[];
}

// ==========================================================
// INTRO SLIDES
// ==========================================================
const SLIDES: IntroSlide[] = [
  {
    id: "1",
    icon: "school",
    color: "#f59e0b",
    gradient: ["#fef3c7", "#fde68a"],
    title: "مدیریت کامل مکتب",
    subtitle:
      "از ثبت نام شاگردان تا مدیریت صنوف، اساتید، حضور و غیاب و راپورهای روزانه — همه در یک سیستم.",
    features: [
      "مدیریت شاگردان و اساتید",
      "صنوف، مضامین و تقسیم اوقات",
      "حضور و غیاب دیجیتلی",
    ],
  },
  {
    id: "2",
    icon: "bar-chart",
    color: "#3b82f6",
    gradient: ["#dbeafe", "#bfdbfe"],
    title: "نمرات و راپورهای دقیق",
    subtitle:
      "ثبت نمرات امتحانات، محاسبه خودکار درجه و رتبه، کارنامه شاگردان و تحلیل عملکرد صنفی.",
    features: [
      "امتحانات و ثبت نمرات",
      "کارنامه چاپی و PDF",
      "تحلیل عملکرد صنفی",
    ],
  },
  {
    id: "3",
    icon: "cash",
    color: "#10b981",
    gradient: ["#d1fae5", "#a7f3d0"],
    title: "مدیریت مالی و فیس",
    subtitle:
      "تخصیص فیس، ثبت پرداخت‌ها، باقی‌مانده فیس، معاشات اساتید، مصارف و راپورهای مالی.",
    features: [
      "فیس شاگردان و پرداخت‌ها",
      "معاشات و مصارف",
      "راپورهای مالی دقیق",
    ],
  },
  {
    id: "4",
    icon: "people",
    color: "#8b5cf6",
    gradient: ["#ede9fe", "#ddd6fe"],
    title: "ارتباط با والدین",
    subtitle:
      "اطلاعیه‌ها، جلسات با والدین، کارنامه شاگرد، حضور و غیاب، فیس و پیامک‌های مستقیم.",
    features: [
      "اعلامیه‌ها و اطلاعیه‌ها",
      "پیامک و اطلاع‌رسانی",
      "دسترسی والدین به کارنامه",
    ],
  },
];

// ==========================================================
// SPLASH SCREEN
// ==========================================================
export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<"splash" | "intro">("splash");
  const [currentSlide, setCurrentSlide] = useState(0);

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;
  const slideY = useRef(new Animated.Value(40)).current;
  const listRef = useRef<FlatList<IntroSlide>>(null);

  // ── Splash entry animation ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 700,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale, slideY]);

  // ── Auto-advance after 2.4s → intro ──
  useEffect(() => {
    const t = setTimeout(() => setPhase("intro"), 2400);
    return () => clearTimeout(t);
  }, []);

  // ── Handle slide change ──
  const onScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== currentSlide) setCurrentSlide(idx);
  };

  const goNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      listRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentSlide(next);
    } else {
      finishIntro();
    }
  };

  const finishIntro = async () => {
    try {
      await AsyncStorage.setItem("asra_intro_seen", "1");
    } catch {
      // ignore
    }
    router.replace("/(auth)/login" as any);
  };

  const goToRegister = async () => {
    try {
      await AsyncStorage.setItem("asra_intro_seen", "1");
    } catch {
      // ignore
    }
    router.replace("/(auth)/register" as any);
  };

  const skipIntro = () => {
    finishIntro();
  };

  // ==========================================================
  // RENDER — SPLASH PHASE
  // ==========================================================
  if (phase === "splash") {
    return (
      <SafeAreaView style={styles.splashContainer} edges={["top", "bottom"]}>
        <LinearGradient
          colors={["#1e293b", "#0f172a"]}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          style={[
            styles.splashContent,
            { opacity: fade, transform: [{ scale }] },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={64} color="#f59e0b" />
          </View>

          {/* Name + tagline */}
          <Animated.View style={{ transform: [{ translateY: slideY }] }}>
            <Text style={styles.brandName}>مکتب اسرا</Text>
            <Text style={styles.brandNameFarsi}>Asra Private High School</Text>
            <View style={styles.divider} />
            <Text style={styles.tagline}>سیستم مدیریت مکتب</Text>
            <Text style={styles.taglineSub}>School Management System</Text>
          </Animated.View>
        </Animated.View>

        {/* Loading dots */}
        <View style={styles.loadingDots}>
          <LoadingDots />
        </View>

        <Text style={styles.footerText}>
          نسخه 9.0.1 • ساخته شده برای مکتب اسرا
        </Text>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // RENDER — INTRO PHASE
  // ==========================================================
  return (
    <SafeAreaView style={styles.introContainer} edges={["top", "bottom"]}>
      {/* Skip */}
      <View style={styles.skipRow}>
        <TouchableOpacity onPress={skipIntro} hitSlop={12}>
          <Text style={styles.skipText}>رد کردن</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient
              colors={item.gradient}
              style={styles.slideIconBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name={item.icon as any} size={72} color={item.color} />
            </LinearGradient>

            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>

            <View style={styles.featureList}>
              {item.features.map((f: string, i: number) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={item.color}
                  />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      />

      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentSlide && styles.dotActive]}
          />
        ))}
      </View>

      {/* Next / Get started */}
      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[
            styles.nextBtn,
            { backgroundColor: SLIDES[currentSlide].color },
          ]}
          onPress={goNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? "شروع کنید" : "بعدی"}
          </Text>
          <Ionicons
            name={
              currentSlide === SLIDES.length - 1
                ? "checkmark-circle"
                : "arrow-back"
            }
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {/* ✅ Login / Register links */}
        <View style={styles.authLinksRow}>
          <TouchableOpacity onPress={finishIntro} hitSlop={12}>
            <Text style={styles.loginText}>قبلاً حساب دارم</Text>
          </TouchableOpacity>

          <View style={styles.dividerDot} />

          <TouchableOpacity onPress={goToRegister} hitSlop={12}>
            <Text style={styles.registerText}>ثبت‌نام کنید</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==========================================================
// SMALL COMPONENTS
// ==========================================================
function LoadingDots() {
  const [dot, setDot] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setDot((d) => (d + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={styles.loadingDotsInner}>
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[
            styles.loadingDot,
            {
              backgroundColor:
                i === dot ? "#f59e0b" : "rgba(245, 158, 11, 0.3)",
              transform: [{ scale: i === dot ? 1.4 : 1 }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// ==========================================================
// STYLES
// ==========================================================
const styles = StyleSheet.create({
  // ==================== SPLASH ====================
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  splashContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 2,
    borderColor: "rgba(245, 158, 11, 0.35)",
  },
  brandName: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
    textAlign: "center",
    letterSpacing: 1,
  },
  brandNameFarsi: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Vazir",
    letterSpacing: 2,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(245, 158, 11, 0.6)",
    alignSelf: "center",
    marginVertical: 20,
    borderRadius: 1,
  },
  tagline: {
    fontSize: 17,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  taglineSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Vazir",
    letterSpacing: 1.5,
  },
  loadingDots: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
  },
  loadingDotsInner: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Vazir",
  },

  // ==================== INTRO ====================
  introContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  skipRow: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  skipText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  slideIconBg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  slideSubtitle: {
    fontSize: 15,
    color: "#64748b",
    fontFamily: "Vazir",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  featureList: {
    alignSelf: "stretch",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#334155",
    fontFamily: "Vazir",
    flex: 1,
    textAlign: "right",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#f59e0b",
  },
  bottomRow: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 16,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "VazirBold",
    fontWeight: "700",
  },

  // ==================== AUTH LINKS ====================
  authLinksRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
  },
  loginText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  registerText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: "VazirBold",
    fontWeight: "700",
  },
});
