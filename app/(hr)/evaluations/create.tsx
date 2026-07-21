// app/(hr)/evaluations/create.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateEvaluationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    period: "",
    teachingQuality: "",
    attendanceScore: "",
    studentFeedback: "",
    teamworkScore: "",
    punctualityScore: "",
    strengths: "",
    weaknesses: "",
    goals: "",
    recommendations: "",
  });

  const handleSubmit = async () => {
    if (!formData.userId || !formData.period) {
      Alert.alert("خطا", "شناسه کارمند و دوره ارزیابی الزامی است");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/evaluations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({
            userId: parseInt(formData.userId),
            period: formData.period,
            teachingQuality: formData.teachingQuality
              ? parseFloat(formData.teachingQuality)
              : undefined,
            attendanceScore: formData.attendanceScore
              ? parseFloat(formData.attendanceScore)
              : undefined,
            studentFeedback: formData.studentFeedback
              ? parseFloat(formData.studentFeedback)
              : undefined,
            teamworkScore: formData.teamworkScore
              ? parseFloat(formData.teamworkScore)
              : undefined,
            punctualityScore: formData.punctualityScore
              ? parseFloat(formData.punctualityScore)
              : undefined,
            strengths: formData.strengths,
            weaknesses: formData.weaknesses,
            goals: formData.goals,
            recommendations: formData.recommendations,
          }),
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "ارزیابی با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت ارزیابی");
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const renderScoreInput = (
    label: string,
    field: keyof typeof formData,
    icon: string,
  ) => (
    <View style={styles.scoreInputContainer}>
      <View style={styles.scoreHeader}>
        <Ionicons name={icon as any} size={18} color="#8b5cf6" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="۱-۵"
        placeholderTextColor="#94a3b8"
        value={formData[field]}
        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
        keyboardType="numeric"
        maxLength={3}
      />
    </View>
  );

  const renderTextArea = (
    label: string,
    field: keyof typeof formData,
    icon: string,
    placeholder: string,
  ) => (
    <View style={styles.textAreaContainer}>
      <View style={styles.textAreaHeader}>
        <Ionicons name={icon as any} size={18} color="#8b5cf6" />
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={formData[field]}
        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ارزیابی عملکرد جدید</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Basic Info Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>اطلاعات پایه</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>شناسه کارمند *</Text>
              <TextInput
                style={styles.input}
                placeholder="شناسه کارمند را وارد کنید"
                placeholderTextColor="#94a3b8"
                value={formData.userId}
                onChangeText={(text) =>
                  setFormData({ ...formData, userId: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>دوره ارزیابی *</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: Q1-2024"
                placeholderTextColor="#94a3b8"
                value={formData.period}
                onChangeText={(text) =>
                  setFormData({ ...formData, period: text })
                }
              />
            </View>
          </View>

          {/* Scores Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star-outline" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>امتیازات (۱-۵)</Text>
            </View>

            <View style={styles.scoresGrid}>
              {renderScoreInput(
                "کیفیت تدریس",
                "teachingQuality",
                "school-outline",
              )}
              {renderScoreInput("حضور", "attendanceScore", "people-outline")}
              {renderScoreInput(
                "بازخورد شاگردان",
                "studentFeedback",
                "chatbubbles-outline",
              )}
              {renderScoreInput(
                "کار تیمی",
                "teamworkScore",
                "people-circle-outline",
              )}
              {renderScoreInput(
                "وقت‌شناسی",
                "punctualityScore",
                "time-outline",
              )}
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#8b5cf6"
              />
              <Text style={styles.sectionTitle}>توضیحات</Text>
            </View>

            {renderTextArea(
              "نقاط قوت",
              "strengths",
              "checkmark-circle-outline",
              "نقاط قوت را وارد کنید...",
            )}
            {renderTextArea(
              "نقاط ضعف",
              "weaknesses",
              "close-circle-outline",
              "نقاط ضعف را وارد کنید...",
            )}
            {renderTextArea(
              "اهداف",
              "goals",
              "flag-outline",
              "اهداف آینده را وارد کنید...",
            )}
            {renderTextArea(
              "توصیه‌ها",
              "recommendations",
              "bulb-outline",
              "توصیه‌ها را وارد کنید...",
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>ثبت ارزیابی</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  backButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  scoresGrid: {
    gap: 12,
  },
  scoreInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: 130,
  },
  textAreaContainer: {
    marginBottom: 12,
  },
  textAreaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
