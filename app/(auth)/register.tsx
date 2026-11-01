// app/(auth)/parent-register.tsx
// Parent-only registration. No student flow here.
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "https://asraschools.cloud/api";
const DEFAULT_SCHOOL_ID = 1;

type Relationship = "father" | "mother" | "guardian" | "other";

interface ChildEntry {
  email: string;
}

interface ParentLookup {
  exists: boolean;
  parentName?: string;
  children: { fullName: string; email: string; className?: string | null }[];
}

const RELATIONSHIPS: { value: Relationship; label: string; icon: string }[] = [
  { value: "father", label: "پدر", icon: "man" },
  { value: "mother", label: "مادر", icon: "woman" },
  { value: "guardian", label: "سرپرست", icon: "person" },
  { value: "other", label: "سایر", icon: "people" },
];

export default function ParentRegisterScreen() {
  const router = useRouter();

  // ── Parent profile (full) ──
  const [parent, setParent] = useState({
    phone: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    relationship: "father" as Relationship,
    address: "",
    occupation: "",
    emergencyContact: "",
  });

  const [showRelationOptions, setShowRelationOptions] = useState(false);
  const [children, setChildren] = useState<ChildEntry[]>([{ email: "" }]);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [parentLookup, setParentLookup] = useState<ParentLookup | null>(null);
  const [forceNewAccount, setForceNewAccount] = useState(false);

  const phoneLookupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Common ──
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ The KEY fix from before:
  //    Show name/email/relationship by default. Hide only when we KNOW
  //    the parent already exists (and user hasn't opted to create new).
  const isExistingParent = parentLookup?.exists === true && !forceNewAccount;
  const showNewParentFields = !isExistingParent;

  // ==========================================================
  // Phone lookup
  // ==========================================================
  const lookupPhone = async (phone: string) => {
    if (phone.replace(/\D/g, "").length < 9) {
      setParentLookup(null);
      return;
    }
    setCheckingPhone(true);
    try {
      const res = await fetch(`${API_BASE_URL}/parent-auth/check-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, schoolId: DEFAULT_SCHOOL_ID }),
      });
      const data = await res.json();
      if (data.success) {
        setParentLookup({
          exists: data.data.exists,
          parentName: data.data.parentName,
          children: data.data.children || [],
        });
      } else {
        setParentLookup({ exists: false, children: [] });
      }
    } catch (err) {
      console.warn("Phone lookup failed:", err);
      setParentLookup({ exists: false, children: [] });
    } finally {
      setCheckingPhone(false);
    }
  };

  const onPhoneChange = (text: string) => {
    setParent((p) => ({ ...p, phone: text }));
    setErrors((e) => ({ ...e, phone: undefined as any }));
    setParentLookup(null);
    setForceNewAccount(false);
    if (phoneLookupTimeout.current) clearTimeout(phoneLookupTimeout.current);
    if (text.replace(/\D/g, "").length >= 9) {
      phoneLookupTimeout.current = setTimeout(() => lookupPhone(text), 500);
    }
  };

  useEffect(() => {
    return () => {
      if (phoneLookupTimeout.current) clearTimeout(phoneLookupTimeout.current);
    };
  }, []);

  // ==========================================================
  // Children
  // ==========================================================
  const addChild = () => {
    if (children.length >= 6) return;
    setChildren([...children, { email: "" }]);
  };
  const updateChild = (i: number, email: string) => {
    const next = [...children];
    next[i].email = email;
    setChildren(next);
    setErrors((e) => ({ ...e, [`child_${i}`]: undefined as any }));
  };
  const removeChild = (i: number) => {
    if (children.length <= 1) return;
    setChildren(children.filter((_, idx) => idx !== i));
  };

  // ==========================================================
  // Validate
  // ==========================================================
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // Phone — always
    if (!parent.phone.trim()) errs.phone = "شماره تلفن الزامی است";
    else if (parent.phone.replace(/\D/g, "").length < 9)
      errs.phone = "شماره تلفن معتبر نیست";

    // Password — always
    if (!parent.password) errs.password = "رمز عبور الزامی است";
    else if (parent.password.length < 6)
      errs.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";

    // New-parent only fields
    if (showNewParentFields) {
      if (!parent.fullName.trim())
        errs.fullName = "نام و نام خانوادگی الزامی است";

      if (!parent.email.trim()) errs.email = "ایمیل الزامی است";
      else if (!/\S+@\S+\.\S+/.test(parent.email))
        errs.email = "ایمیل معتبر نیست";

      if (!parent.confirmPassword)
        errs.confirmPassword = "تکرار رمز عبور الزامی است";
      else if (parent.password !== parent.confirmPassword)
        errs.confirmPassword = "رمز عبور و تکرار آن مطابقت ندارند";

      if (!parent.relationship) errs.relationship = "نسبت با شاگرد الزامی است";
    }

    // Children — always
    const validChildren = children.filter((c) => c.email.trim());
    if (validChildren.length === 0)
      errs.children = "حداقل یک ایمیل فرزند الزامی است";
    validChildren.forEach((c, i) => {
      if (!/\S+@\S+\.\S+/.test(c.email.trim()))
        errs[`child_${i}`] = "ایمیل معتبر نیست";
    });

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ==========================================================
  // Submit
  // ==========================================================
  const handleSubmit = async () => {
    if (!validate()) return;

    const childEmails = children
      .map((c) => c.email.trim().toLowerCase())
      .filter(Boolean);

    setLoading(true);
    try {
      // ── Case B: existing parent → login + add children ──
      if (isExistingParent) {
        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: parent.phone.trim(),
            password: parent.password,
          }),
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) {
          throw new Error(
            loginData.message ||
              "این شماره قبلاً ثبت شده است. رمز عبور اشتباه است.",
          );
        }

        const token = loginData.token;
        await AsyncStorage.setItem("auth_token", token);
        await AsyncStorage.setItem("user_data", JSON.stringify(loginData.User));

        const linked: string[] = [];
        for (const email of childEmails) {
          const linkRes = await fetch(`${API_BASE_URL}/parent-auth/add-child`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ childEmail: email }),
          });
          const linkData = await linkRes.json();
          if (linkRes.ok) linked.push(email);
          else if (linkData.code !== "ALREADY_LINKED")
            throw new Error(linkData.message || `خطا در افزودن ${email}`);
        }

        Alert.alert(
          "موفقیت",
          linked.length > 0
            ? `${linked.length} فرزند به حساب شما اضافه شد`
            : "فرزندان قبلاً به حساب شما متصل بودند",
          [
            {
              text: "باشه",
              onPress: () => router.replace("/(parent)/(tabs)" as any),
            },
          ],
        );
        return;
      }

      // ── Case A: new parent → full registration ──
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: parent.fullName.trim(),
          email: parent.email.trim().toLowerCase(),
          password: parent.password,
          phone: parent.phone.trim(),
          role: "parent",
          schoolId: DEFAULT_SCHOOL_ID,
          childEmail: childEmails[0],
          relationship: parent.relationship,
          address: parent.address.trim() || undefined,
          occupation: parent.occupation.trim() || undefined,
          emergencyContact: parent.emergencyContact.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.code === "PARENT_PHONE_TAKEN"
            ? "این شماره تلفن قبلاً ثبت شده است. لطفاً وارد شوید."
            : data.message || "ثبت‌نام ناموفق بود",
        );
      }

      const token = data.token;
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(data.User));

      // Link remaining children
      for (const email of childEmails.slice(1)) {
        try {
          await fetch(`${API_BASE_URL}/parent-auth/add-child`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ childEmail: email }),
          });
        } catch (err) {
          console.warn("Failed to link extra child:", email, err);
        }
      }

      Alert.alert("موفقیت", `${childEmails.length} فرزند به حساب شما متصل شد`, [
        {
          text: "باشه",
          onPress: () => router.replace("/(parent)/(tabs)" as any),
        },
      ]);
    } catch (err: any) {
      Alert.alert("خطا", err?.message || "ثبت‌نام ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // Render
  // ==========================================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={{ flex: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={loading}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>ثبت‌نام والدین</Text>
            </View>

            <View style={styles.card}>
              {/* Intro */}
              <View style={styles.introBox}>
                <Ionicons name="people" size={28} color={Colors.primary} />
                <Text style={styles.introTitle}>حساب والدین</Text>
                <Text style={styles.introText}>
                  یک حساب برای همه فرزندان شما در مکتب
                </Text>
              </View>

              {/* ── LOGIN INFO ── */}
              <Text style={styles.sectionLabel}>اطلاعات ورود</Text>

              {/* Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>شماره تلفن *</Text>
                <View
                  style={[
                    styles.inputBox,
                    errors.phone && styles.inputBoxError,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                  <TextInput
                    style={styles.input}
                    value={parent.phone}
                    onChangeText={onPhoneChange}
                    placeholder="07XXXXXXXX"
                    placeholderTextColor={Colors.textSecondary}
                    keyboardType="phone-pad"
                    textAlign="right"
                    editable={!loading && !checkingPhone}
                  />
                  {checkingPhone && (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  )}
                </View>
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}

                {isExistingParent && (
                  <View style={styles.infoBanner}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.success}
                    />
                    <Text style={styles.infoBannerText}>
                      حساب موجود برای {parentLookup?.parentName}. رمز عبور خود
                      را وارد کنید تا فرزندان جدید اضافه شوند.
                    </Text>
                  </View>
                )}

                {showNewParentFields &&
                  parent.phone.replace(/\D/g, "").length >= 9 &&
                  !checkingPhone && (
                    <View style={styles.newBanner}>
                      <Ionicons
                        name="sparkles"
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.newBannerText}>
                        حساب جدید — خوش آمدید
                      </Text>
                    </View>
                  )}

                {/* Manual override */}
                {parentLookup?.exists === true && !forceNewAccount && (
                  <TouchableOpacity
                    onPress={() => setForceNewAccount(true)}
                    style={{ marginTop: 6 }}
                  >
                    <Text style={styles.overrideLink}>
                      حساب قبلی را نمی‌خواهم — ایجاد حساب جدید
                    </Text>
                  </TouchableOpacity>
                )}
                {forceNewAccount && (
                  <TouchableOpacity
                    onPress={() => setForceNewAccount(false)}
                    style={{ marginTop: 6 }}
                  >
                    <Text
                      style={[
                        styles.overrideLink,
                        { color: Colors.textSecondary },
                      ]}
                    >
                      بازگشت به حالت افزودن فرزند به حساب موجود
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Password */}
              <Field
                label={
                  isExistingParent ? "رمز عبور حساب موجود *" : "رمز عبور *"
                }
                icon="lock-closed-outline"
                value={parent.password}
                error={errors.password}
                onChangeText={(t) => {
                  setParent((p) => ({ ...p, password: t }));
                  setErrors((e) => ({
                    ...e,
                    password: undefined as any,
                  }));
                }}
                secureTextEntry={!showPassword}
                toggleSecure={() => setShowPassword(!showPassword)}
              />

              {/* ── NEW PARENT FIELDS ── */}
              {showNewParentFields && (
                <>
                  <Text style={styles.sectionLabel}>مشخصات شخصی</Text>

                  <Field
                    label="نام و نام خانوادگی *"
                    icon="person-outline"
                    value={parent.fullName}
                    error={errors.fullName}
                    onChangeText={(t) => {
                      setParent((p) => ({ ...p, fullName: t }));
                      setErrors((e) => ({
                        ...e,
                        fullName: undefined as any,
                      }));
                    }}
                  />

                  <Field
                    label="ایمیل *"
                    icon="mail-outline"
                    value={parent.email}
                    error={errors.email}
                    onChangeText={(t) => {
                      setParent((p) => ({ ...p, email: t }));
                      setErrors((e) => ({
                        ...e,
                        email: undefined as any,
                      }));
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <Field
                    label="تکرار رمز عبور *"
                    icon="lock-closed-outline"
                    value={parent.confirmPassword}
                    error={errors.confirmPassword}
                    onChangeText={(t) => {
                      setParent((p) => ({
                        ...p,
                        confirmPassword: t,
                      }));
                      setErrors((e) => ({
                        ...e,
                        confirmPassword: undefined as any,
                      }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    toggleSecure={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />

                  {/* Relationship */}
                  <View style={styles.field}>
                    <Text style={styles.label}>نسبت با شاگرد *</Text>
                    <TouchableOpacity
                      style={[
                        styles.inputBox,
                        errors.relationship && styles.inputBoxError,
                      ]}
                      onPress={() =>
                        setShowRelationOptions(!showRelationOptions)
                      }
                      disabled={loading}
                    >
                      <Text style={styles.inputText}>
                        {RELATIONSHIPS.find(
                          (r) => r.value === parent.relationship,
                        )?.label || "انتخاب نسبت"}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                    {showRelationOptions && (
                      <View style={styles.optionsBox}>
                        {RELATIONSHIPS.map((r) => (
                          <TouchableOpacity
                            key={r.value}
                            style={styles.optionItem}
                            onPress={() => {
                              setParent((p) => ({
                                ...p,
                                relationship: r.value,
                              }));
                              setShowRelationOptions(false);
                              setErrors((e) => ({
                                ...e,
                                relationship: undefined as any,
                              }));
                            }}
                          >
                            <Ionicons
                              name={r.icon as any}
                              size={18}
                              color={Colors.primary}
                            />
                            <Text style={styles.optionText}>{r.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {errors.relationship && (
                      <Text style={styles.errorText}>
                        {errors.relationship}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.sectionLabel}>
                    اطلاعات تکمیلی (اختیاری)
                  </Text>

                  <Field
                    label="آدرس محل سکونت"
                    icon="home-outline"
                    value={parent.address}
                    onChangeText={(t) =>
                      setParent((p) => ({ ...p, address: t }))
                    }
                  />
                  <Field
                    label="شغل"
                    icon="briefcase-outline"
                    value={parent.occupation}
                    onChangeText={(t) =>
                      setParent((p) => ({ ...p, occupation: t }))
                    }
                  />
                  <Field
                    label="شماره تماس اضطراری"
                    icon="call-outline"
                    value={parent.emergencyContact}
                    onChangeText={(t) =>
                      setParent((p) => ({
                        ...p,
                        emergencyContact: t,
                      }))
                    }
                    keyboardType="phone-pad"
                  />
                </>
              )}

              {/* ── Existing children preview ── */}
              {isExistingParent &&
                parentLookup &&
                parentLookup.children.length > 0 && (
                  <View style={styles.existingChildrenBox}>
                    <Text style={styles.existingChildrenTitle}>
                      فرزندان موجود ({parentLookup.children.length})
                    </Text>
                    {parentLookup.children.map((c, i) => (
                      <View key={i} style={styles.existingChildRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.success}
                        />
                        <Text style={styles.existingChildText}>
                          {c.fullName}
                          {c.className ? ` (${c.className})` : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* ── CHILDREN ── */}
              <Text style={styles.sectionLabel}>فرزندان شما</Text>

              <View style={styles.field}>
                <Text style={styles.label}>ایمیل فرزند(ان) *</Text>

                {children.map((child, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <View
                      style={[
                        styles.inputBox,
                        errors[`child_${i}`] && styles.inputBoxError,
                      ]}
                    >
                      <Ionicons
                        name="school-outline"
                        size={20}
                        color={Colors.textSecondary}
                        style={{ marginLeft: 8 }}
                      />
                      <TextInput
                        style={styles.input}
                        value={child.email}
                        onChangeText={(t) => updateChild(i, t)}
                        placeholder={`ایمیل فرزند ${i + 1}`}
                        placeholderTextColor={Colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        textAlign="right"
                        editable={!loading}
                      />
                      {children.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeChild(i)}
                          disabled={loading}
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color={Colors.danger}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    {errors[`child_${i}`] && (
                      <Text style={styles.errorText}>
                        {errors[`child_${i}`]}
                      </Text>
                    )}
                  </View>
                ))}

                {children.length < 6 && (
                  <TouchableOpacity
                    style={styles.addChildBtn}
                    onPress={addChild}
                    disabled={loading}
                  >
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.addChildText}>افزودن فرزند دیگر</Text>
                  </TouchableOpacity>
                )}

                {errors.children && (
                  <Text style={styles.errorText}>{errors.children}</Text>
                )}
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isExistingParent
                      ? "افزودن فرزندان به حساب"
                      : "ایجاد حساب والدین"}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Login link */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>حساب دارید؟</Text>
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/login" as any)}
                  disabled={loading}
                >
                  <Text style={styles.footerLink}>وارد شوید</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================================
// Field component
// ==========================================================
function Field({
  label,
  icon,
  value,
  error,
  onChangeText,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  toggleSecure,
}: {
  label: string;
  icon: any;
  value: string;
  error?: string;
  onChangeText: (t: string) => void;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  toggleSecure?: () => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, error && styles.inputBoxError]}>
        <Ionicons
          name={icon}
          size={20}
          color={Colors.textSecondary}
          style={{ marginLeft: 8 }}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={label.replace(" *", "")}
          placeholderTextColor={Colors.textSecondary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || "sentences"}
          secureTextEntry={secureTextEntry}
          textAlign="right"
        />
        {toggleSecure && (
          <TouchableOpacity onPress={toggleSecure} style={{ padding: 4 }}>
            <Ionicons
              name={secureTextEntry ? "eye" : "eye-off"}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ==========================================================
// Styles
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  introBox: {
    alignItems: "center",
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 6,
    textAlign: "center",
  },
  introText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "right",
    marginTop: 16,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  field: { gap: 6, marginBottom: 10 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "right",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  inputBoxError: { borderColor: Colors.danger },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
    paddingVertical: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: "right",
    marginTop: 2,
  },

  optionsBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: "right",
    flex: 1,
  },

  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#065f46",
    textAlign: "right",
  },
  newBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  newBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primary,
    textAlign: "right",
  },
  overrideLink: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: "right",
    textDecorationLine: "underline",
  },

  existingChildrenBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginTop: 10,
  },
  existingChildrenTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "right",
    marginBottom: 4,
  },
  existingChildRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  existingChildText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    textAlign: "right",
  },

  addChildBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    marginTop: 4,
  },
  addChildText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600",
  },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
