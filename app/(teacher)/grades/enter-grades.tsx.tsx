// app/(teacher)/grades/enter-grades.tsx
import { BASE_URL } from "@/src/config/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  score: number | null;
  marks: number | null;
  feedback?: string;
  isSaved?: boolean;
}

interface Exam {
  id: number;
  name: string;
  type: string;
  maxScore: number;
  month?: number;
  year?: number;
}

export default function EnterGradesScreen() {
  const { type, classId, subjectId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear() - 621,
  );
  const [publishResults, setPublishResults] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number>(
    classId ? parseInt(classId as string) : 0,
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(
    subjectId ? parseInt(subjectId as string) : 0,
  );

  const examType = type as string;
  const isMonthly = examType === "MONTHLY";
  const isHalfYearly = examType === "HALF_YEARLY";
  const isFinal = examType === "FINAL";

  const persianMonths = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];

  // Fetch teacher's classes on mount
  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchSubjectsForClass(selectedClassId);
    }
  }, [selectedClassId]);

  // Load exam data when class, subject, or exam type changes
  useEffect(() => {
    if (selectedClassId && selectedSubjectId) {
      loadExamData();
    }
  }, [
    selectedClassId,
    selectedSubjectId,
    examType,
    selectedMonth,
    selectedYear,
  ]);

  const fetchTeacherClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/api/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
        if (result.data.length > 0 && !selectedClassId) {
          setSelectedClassId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjectsForClass = async (classId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/teacher/classes/${classId}/subjects`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setSubjects(result.data);
        if (result.data.length > 0 && !selectedSubjectId) {
          setSelectedSubjectId(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const loadExamData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/teacher/exams/get-or-create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classId: selectedClassId,
            subjectId: selectedSubjectId,
            examType: examType,
            month: isMonthly ? selectedMonth : undefined,
            year: selectedYear,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setExam(result.data.exam);
        setStudents(result.data.students);
      } else {
        Alert.alert("خطا", result.message || "Failed to load exam data");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "Failed to load exam data");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentScore = (studentId: number, score: string) => {
    const numScore = score === "" ? null : parseFloat(score);
    if (
      numScore !== null &&
      (numScore < 0 || numScore > (exam?.maxScore || 100))
    ) {
      Alert.alert("خطا", `نمره باید بین ۰ و ${exam?.maxScore} باشد`);
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, score: numScore, marks: numScore } : s,
      ),
    );
  };

  const updateStudentFeedback = (studentId: number, feedback: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, feedback } : s)),
    );
  };

  const saveGrades = async () => {
    const gradesToSave = students
      .filter((s) => s.score !== null)
      .map((s) => ({
        studentId: s.id,
        score: s.score,
        feedback: s.feedback || "",
      }));

    if (gradesToSave.length === 0) {
      Alert.alert("خطا", "حداقل یک نمره وارد کنید");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/teacher/exams/save-grades`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            examId: exam!.id,
            grades: gradesToSave,
            publishResults: publishResults,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        Alert.alert(
          "موفق",
          publishResults ? "نمرات ذخیره و منتشر شد" : "نمرات ذخیره شد",
          [{ text: "تأیید", onPress: () => router.back() }],
        );
      } else {
        Alert.alert("خطا", result.message || "Failed to save grades");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "Failed to save grades");
    } finally {
      setSaving(false);
    }
  };

  const getScoreStatus = (score: number | null) => {
    if (score === null) return "text-gray-400";
    if (isHalfYearly && score <= 15) return "text-red-600 font-bold";
    if (score >= (exam?.maxScore || 100) * 0.7)
      return "text-green-600 font-bold";
    if (score >= (exam?.maxScore || 100) * 0.5) return "text-yellow-600";
    return "text-red-500";
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-3 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-forward" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text className="text-lg font-bold dark:text-white">
          {exam?.name || "ثبت نمرات"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Class and Subject Selectors */}
        <TouchableOpacity
          className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-3 flex-row justify-between items-center"
          onPress={() => setShowClassPicker(true)}
        >
          <Text className="dark:text-white">
            کلاس: {selectedClass?.name || "انتخاب کنید"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-4 flex-row justify-between items-center"
          onPress={() => selectedClassId && setShowSubjectPicker(true)}
        >
          <Text className="dark:text-white">
            درس: {selectedSubject?.name || "انتخاب کنید"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        {/* Exam Info */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
          <Text className="text-blue-800 dark:text-blue-300 font-semibold text-right">
            {isMonthly &&
              `امتحان ماه ${persianMonths[selectedMonth - 1]} - سال ${selectedYear}`}
            {isHalfYearly && `امتحان چهارنیماه - سال ${selectedYear}`}
            {isFinal && `امتحان نهایی - سال ${selectedYear}`}
          </Text>
          <Text className="text-blue-700 dark:text-blue-400 text-sm text-right mt-1">
            حداکثر نمره: {exam?.maxScore} | وزن:{" "}
            {isMonthly ? "۲۰٪" : isHalfYearly ? "۴۰٪" : "۶۰٪"}
          </Text>
          {isHalfYearly && (
            <Text className="text-red-600 dark:text-red-400 text-sm text-right mt-1">
              ⚠️ نمره کمتر از ۱۵ → مردودی در این درس
            </Text>
          )}
        </View>

        {/* Month Selector for Monthly Exams */}
        {isMonthly && (
          <TouchableOpacity
            className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-4 flex-row justify-between items-center"
            onPress={() => setShowMonthPicker(true)}
          >
            <Text className="dark:text-white">
              ماه: {persianMonths[selectedMonth - 1]}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        )}

        {/* Publish Option */}
        <View className="flex-row items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl mb-4">
          <Text className="dark:text-white">
            منتشر کردن نتایج برای دانش‌آموزان
          </Text>
          <TouchableOpacity
            onPress={() => setPublishResults(!publishResults)}
            className={`w-12 h-6 rounded-full ${publishResults ? "bg-green-500" : "bg-gray-300"} justify-center px-1`}
          >
            <View
              className={`w-5 h-5 rounded-full bg-white transform ${
                publishResults ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </TouchableOpacity>
        </View>

        {/* Students List */}
        <Text className="text-lg font-semibold mb-3 dark:text-white text-right">
          دانش‌آموزان ({students.length})
        </Text>

        {students.map((student, index) => (
          <View
            key={student.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="font-semibold dark:text-white text-right">
                  {index + 1}. {student.name}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 text-right">
                  {student.rollNumber}
                </Text>
              </View>
              {student.score !== null && (
                <View
                  className={`px-2 py-1 rounded-full ${isHalfYearly && student.score <= 15 ? "bg-red-100 dark:bg-red-900/30" : "bg-gray-100 dark:bg-gray-700"}`}
                >
                  <Text
                    className={`text-sm font-bold ${getScoreStatus(student.score)}`}
                  >
                    {student.score.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            <View className="mb-3">
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-right">
                نمره (از {exam?.maxScore})
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:text-white text-right"
                keyboardType="numeric"
                placeholder={`۰ - ${exam?.maxScore}`}
                placeholderTextColor="#9CA3AF"
                value={student.score?.toString() || ""}
                onChangeText={(text) => updateStudentScore(student.id, text)}
                textAlign="right"
              />
            </View>

            <View>
              <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-right">
                بازخورد (اختیاری)
              </Text>
              <TextInput
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:text-white text-right"
                placeholder="نظر یا بازخورد برای دانش‌آموز..."
                placeholderTextColor="#9CA3AF"
                value={student.feedback || ""}
                onChangeText={(text) => updateStudentFeedback(student.id, text)}
                multiline
                textAlign="right"
              />
            </View>
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl mb-8 ${saving ? "bg-gray-400" : "bg-blue-600"}`}
          onPress={saveGrades}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold text-lg">
              {publishResults ? "ذخیره و انتشار نمرات" : "ذخیره نمرات"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Class Picker Modal */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-4">
            <Text className="text-lg font-bold mb-4 dark:text-white text-right">
              انتخاب کلاس
            </Text>
            <ScrollView className="max-h-80">
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                  onPress={() => {
                    setSelectedClassId(cls.id);
                    setShowClassPicker(false);
                  }}
                >
                  <Text className="dark:text-white text-right">{cls.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
              onPress={() => setShowClassPicker(false)}
            >
              <Text className="text-center dark:text-white">بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Subject Picker Modal */}
      <Modal visible={showSubjectPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-4">
            <Text className="text-lg font-bold mb-4 dark:text-white text-right">
              انتخاب درس
            </Text>
            <ScrollView className="max-h-80">
              {subjects.map((subj) => (
                <TouchableOpacity
                  key={subj.id}
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                  onPress={() => {
                    setSelectedSubjectId(subj.id);
                    setShowSubjectPicker(false);
                  }}
                >
                  <Text className="dark:text-white text-right">
                    {subj.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
              onPress={() => setShowSubjectPicker(false)}
            >
              <Text className="text-center dark:text-white">بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-4">
            <Text className="text-lg font-bold mb-4 dark:text-white text-right">
              انتخاب ماه
            </Text>
            <ScrollView className="max-h-80">
              {persianMonths.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text className="dark:text-white text-right">{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              className="mt-4 p-3 bg-gray-200 dark:bg-gray-700 rounded-xl"
              onPress={() => setShowMonthPicker(false)}
            >
              <Text className="text-center dark:text-white">بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
