// app/(principal)/academic/timetable.tsx - FIXED

import {
  principalAcademicApi,
  TimetableEntry,
} from "@/src/config/principalAcademicApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];
const PERIODS = [
  { id: 0, time: "7:30 - 8:15" },
  { id: 1, time: "8:15 - 9:00" },
  { id: 2, time: "9:00 - 9:45" },
  { id: 3, time: "10:00 - 10:45" },
  { id: 4, time: "10:45 - 11:30" },
  { id: 5, time: "11:30 - 12:15" },
  { id: 6, time: "12:15 - 13:00" },
];

export default function TimetableScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [periods, setPeriods] = useState<TimetableEntry[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass !== null) {
      fetchTimetable();
    }
  }, [selectedClass, selectedDay]);

  // ✅ FIX: Use the API client with the correct endpoint
  const fetchClasses = async () => {
    try {
      // Use the existing API client or direct fetch with proper URL
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/principal/classes`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );

      // ✅ Check if response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
        if (result.data.length > 0) {
          setSelectedClass(result.data[0].id);
        }
      }
    } catch (error) {
      console.error("Fetch classes error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const fetchTimetable = async () => {
    if (selectedClass === null) return;
    try {
      const response = await principalAcademicApi.getTimetable(
        selectedClass,
        selectedDay,
      );
      if (response.success) {
        setPeriods(response.data.periods);
        setClassInfo(response.data.class);
      }
    } catch (error) {
      console.error("Fetch timetable error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimetable();
  };

  const renderPeriod = ({ item }: { item: TimetableEntry }) => (
    <View style={[styles.periodCard, item.isEmpty && styles.emptyPeriod]}>
      <Text style={styles.periodTime}>{item.time}</Text>
      <Text style={[styles.periodSubject, item.isEmpty && styles.emptyText]}>
        {item.subject}
      </Text>
      {!item.isEmpty && (
        <Text style={styles.periodTeacher}>{item.teacher}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تقسیم اوقات</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Class Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.classSelector}
      >
        {classes.map((cls) => (
          <TouchableOpacity
            key={cls.id}
            style={[
              styles.classTab,
              selectedClass === cls.id && styles.classTabActive,
            ]}
            onPress={() => setSelectedClass(cls.id)}
          >
            <Text
              style={[
                styles.classTabText,
                selectedClass === cls.id && styles.classTabTextActive,
              ]}
            >
              {cls.name} {cls.section}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        {DAYS.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayTab,
              selectedDay === index && styles.dayTabActive,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayTabText,
                selectedDay === index && styles.dayTabTextActive,
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timetable */}
      {classInfo && (
        <View style={styles.classInfo}>
          <Text style={styles.classInfoText}>
            صنف: {classInfo.name} - {DAYS[selectedDay]}
          </Text>
        </View>
      )}

      <FlatList
        data={periods}
        renderItem={renderPeriod}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ برنامه‌ای یافت نشد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  classSelector: {
    maxHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  classTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  classTabActive: { backgroundColor: "#f59e0b" },
  classTabText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  classTabTextActive: { color: "#fff" },
  daySelector: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dayTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  dayTabActive: { backgroundColor: "#fef3c7" },
  dayTabText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  dayTabTextActive: { color: "#f59e0b", fontWeight: "600" },
  classInfo: {
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  classInfoText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  listContent: { padding: 16, gap: 8 },
  periodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  emptyPeriod: {
    backgroundColor: "#f8fafc",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  periodTime: {
    width: 80,
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  periodSubject: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  periodTeacher: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
