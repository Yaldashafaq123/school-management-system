import { BASE_URL } from "@/src/config/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ClassItem {
  id: number;
  name: string;
  section: string;
  academicYear: string;
  isActive: boolean;
  studentCount: number;
  subjects: SubjectItem[];
  role: string;
}

interface SubjectItem {
  id: number;
  name: string;
}

export default function GradingScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      console.log("Fetching classes for teacher...");
      const response = await fetch(`${BASE_URL}/api/teacher/grades/classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Classes response:", result);

      if (result.success) {
        setClasses(result.data || []);
        setError(null);

        // Auto-select first class if available
        if (result.data && result.data.length > 0 && !selectedClass) {
          setSelectedClass(result.data[0]);
          await fetchSubjects(result.data[0].id);
        }
      } else {
        setError(result.message || "Failed to load classes");
      }
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSubjects = async (classId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");

      console.log(`Fetching subjects for class ID: ${classId}`);
      const response = await fetch(
        `${BASE_URL}/api/teacher/grades/subjects/${classId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();
      console.log("Subjects response:", result);

      if (result.success) {
        setSubjects(result.data || []);
        console.log(`Subjects set: ${result.data?.length || 0}`);
        // Auto-select first subject if available
        if (result.data && result.data.length > 0 && !selectedSubject) {
          setSelectedSubject(result.data[0]);
        }
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      console.error("Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  const handleClassSelect = async (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setSelectedSubject(null);
    setSubjects([]);
    await fetchSubjects(classItem.id);
  };

  const handleSubjectSelect = (subject: SubjectItem) => {
    setSelectedSubject(subject);
  };

  const handleStartGrading = () => {
    if (!selectedClass) {
      Alert.alert("خطا", "لطفاً ابتدا یک کلاس انتخاب کنید");
      return;
    }
    if (!selectedSubject) {
      Alert.alert("خطا", "لطفاً ابتدا یک درس انتخاب کنید");
      return;
    }

    // Navigate to grade entry screen
    router.push({
      pathname: "./enter-grades",
      params: {
        classId: selectedClass.id.toString(),
        className: selectedClass.name,
        subjectId: selectedSubject.id.toString(),
        subjectName: selectedSubject.name,
      },
    });
  };

  const handleViewResults = () => {
    if (!selectedClass) {
      Alert.alert("خطا", "لطفاً ابتدا یک کلاس انتخاب کنید");
      return;
    }

    router.push({
      pathname: "./results",
      params: { classId: selectedClass.id.toString() },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchClasses();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity
      className={`p-4 rounded-xl mb-2 ${
        selectedClass?.id === item.id
          ? "bg-blue-600 border-blue-600"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      }`}
      onPress={() => handleClassSelect(item)}
    >
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text
            className={`text-lg font-semibold ${
              selectedClass?.id === item.id
                ? "text-white"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {item.name} {item.section ? `- ${item.section}` : ""}
          </Text>
          <Text
            className={`text-sm mt-1 ${
              selectedClass?.id === item.id
                ? "text-blue-100"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {item.academicYear || "سال تحصیلی"} • {item.studentCount} دانش‌آموز
            • {item.subjects?.length || 0} درس
          </Text>
        </View>
        {selectedClass?.id === item.id && (
          <Ionicons name="checkmark-circle" size={24} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSubjectItem = ({ item }: { item: SubjectItem }) => (
    <TouchableOpacity
      className={`p-3 rounded-xl mb-2 ${
        selectedSubject?.id === item.id
          ? "bg-green-600"
          : "bg-gray-100 dark:bg-gray-800"
      }`}
      onPress={() => handleSubjectSelect(item)}
    >
      <Text
        className={`text-center ${
          selectedSubject?.id === item.id
            ? "text-white font-semibold"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 p-4">
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text className="text-red-500 text-center mt-4 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-xl"
          onPress={fetchClasses}
        >
          <Text className="text-white font-semibold">تلاش مجدد</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#3B82F6"]}
        />
      }
    >
      <View className="p-4">
        {/* Header */}
        <Text className="text-2xl font-bold mb-2 dark:text-white text-right">
          ثبت نمرات و امتحانات
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-6 text-right">
          سیستم نمره‌دهی افغانی - ثبت نمرات ماهانه، چهارنیماه و نهایی
        </Text>

        {/* Afghan Grading System Info */}
        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 border border-blue-200 dark:border-blue-800">
          <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2 text-right">
            📖 سیستم نمره‌دهی افغانی
          </Text>
          <View>
            <Text className="text-blue-700 dark:text-blue-400 text-sm text-right">
              • امتحانات ماهانه: ۲۰ نمره (۲۰٪ نمره کل)
            </Text>
            <Text className="text-blue-700 dark:text-blue-400 text-sm text-right mt-1">
              • امتحان چهارنیماه: ۴۰ نمره (۴۰٪ نمره کل)
            </Text>
            <Text className="text-blue-700 dark:text-blue-400 text-sm text-right mt-1">
              • امتحان نهایی: ۶۰ نمره (۶۰٪ نمره کل)
            </Text>
            <View className="h-px bg-blue-200 dark:bg-blue-800 my-2" />
            <Text className="text-red-600 dark:text-red-400 text-sm font-bold text-right">
              ⚠️ نمره کمتر از ۱۵ در چهارنیماه → مردودی خودکار
            </Text>
            <Text className="text-red-600 dark:text-red-400 text-sm font-bold text-right mt-1">
              ⚠️ مجموع نمرات کمتر از ۳۹ → مردودی در درس
            </Text>
          </View>
        </View>

        {/* Two Column Layout */}
        <View className="flex-row gap-4">
          {/* Left Column - Classes */}
          <View className="flex-1">
            <Text className="text-lg font-bold mb-3 dark:text-white text-right">
              کلاس‌ها
            </Text>
            {classes.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 p-8 rounded-xl items-center">
                <Ionicons name="school-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-3">
                  هیچ کلاسی یافت نشد
                </Text>
              </View>
            ) : (
              <FlatList
                data={classes}
                renderItem={renderClassItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                className="mb-4"
              />
            )}
          </View>

          {/* Right Column - Subjects */}
          <View className="flex-1">
            <Text className="text-lg font-bold mb-3 dark:text-white text-right">
              دروس
            </Text>
            {!selectedClass ? (
              <View className="bg-white dark:bg-gray-800 p-8 rounded-xl items-center">
                <Ionicons name="book-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-3">
                  ابتدا یک کلاس انتخاب کنید
                </Text>
              </View>
            ) : subjects.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 p-8 rounded-xl items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={48}
                  color="#9CA3AF"
                />
                <Text className="text-gray-500 dark:text-gray-400 text-center mt-3">
                  هیچ درسی برای این کلاس یافت نشد
                </Text>
              </View>
            ) : (
              <FlatList
                data={subjects}
                renderItem={renderSubjectItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                className="mb-4"
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 py-4 rounded-xl ${
              selectedClass && selectedSubject
                ? "bg-blue-600"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
            onPress={handleStartGrading}
            disabled={!selectedClass || !selectedSubject}
          >
            <Text
              className={`text-center font-semibold ${
                selectedClass && selectedSubject
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              ثبت نمرات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-xl ${
              selectedClass ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
            }`}
            onPress={handleViewResults}
            disabled={!selectedClass}
          >
            <Text
              className={`text-center font-semibold ${
                selectedClass
                  ? "text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              مشاهده نتایج
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-6 mb-10">
          <Text className="text-gray-400 dark:text-gray-600 text-xs text-center">
            با انتخاب کلاس و درس می‌توانید نمرات را ثبت و مدیریت کنید
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
