// app/(student)/timetable/index.tsx - FIXED VERSION

import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  PERSIAN_DAYS,
  studentTimetableApi,
  TIME_PERIODS,
  TimetableData,
} from "@/src/config/studentTimetableApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Define the Entry type based on your backend response
interface TimetableEntry {
  id: number;
  day: string; // Persian day name
  dayIndex: number; // Day index (0-5)
  period: string; // Time range
  periodIndex: number; // Period index (0-6)
  subject: string;
  teacher: string;
  teacherImage?: string;
  room: string;
  color: string;
  startTime: string;
  endTime: string;
  teacherId?: number;
  subjectId?: number;
}

export default function WeeklyTimetableScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [timetableData, setTimetableData] = useState<TimetableData | null>(
    null,
  );

  const loadTimetable = useCallback(async () => {
    try {
      const response = await studentTimetableApi.getWeeklyTimetable();
      console.log("Full response:", JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        setTimetableData(response.data);
        // Log first entry to debug
        if (response.data.entries && response.data.entries.length > 0) {
          console.log("First entry:", response.data.entries[0]);
        }
      }
    } catch (error) {
      console.error("Error loading timetable:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTimetable();
  };

  // FIXED: Get classes for a specific day using dayIndex
  const getClassesForDay = (dayIndex: number) => {
    if (!timetableData?.entries) return [];
    return (timetableData.entries as any[]).filter(
      (entry: any) => entry.dayIndex === dayIndex,
    );
  };

  // FIXED: Get class for specific day and period
  const getClassesForPeriod = (dayIndex: number, periodIndex: number) => {
    if (!timetableData?.entries) return null;
    return (timetableData.entries as any[]).find(
      (entry: any) =>
        entry.dayIndex === dayIndex && entry.periodIndex === periodIndex,
    );
  };

  const DayView = ({
    dayIndex,
    dayName,
  }: {
    dayIndex: number;
    dayName: string;
  }) => {
    const dayClasses = getClassesForDay(dayIndex);

    if (selectedDay !== null && selectedDay !== dayName) {
      return null;
    }

    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{dayName}</Text>
          <Text style={styles.classesCount}>{dayClasses.length} صنف</Text>
        </View>

        {dayClasses.length === 0 ? (
          <View style={styles.emptyDay}>
            <Ionicons
              name="calendar-outline"
              size={40}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyDayText}>
              صنفی برای این روز برنامه‌ریزی نشده
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {dayClasses.map((entry: TimetableEntry) => (
              <View
                key={entry.id}
                style={[
                  styles.classCard,
                  { borderLeftColor: entry.color, borderLeftWidth: 4 },
                ]}
              >
                <View style={styles.classHeader}>
                  <View style={styles.subjectContainer}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: entry.color },
                      ]}
                    />
                    <Text style={styles.subjectText}>{entry.subject}</Text>
                  </View>
                  <Text style={styles.periodText}>ساعت {entry.startTime}</Text>
                </View>

                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="person"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{entry.teacher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location"
                      size={16}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.detailText}>{entry.room}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const GridView = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Header row */}
          <View style={styles.gridHeader}>
            <View style={[styles.gridCell, styles.timeCell]} />
            {PERSIAN_DAYS.map((day, index) => (
              <View key={index} style={[styles.gridCell, styles.dayHeaderCell]}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time slots */}
          {TIME_PERIODS.map((time, periodIndex) => (
            <View key={periodIndex} style={styles.gridRow}>
              <View style={[styles.gridCell, styles.timeCell]}>
                <Text style={styles.timeText}>{time}</Text>
              </View>

              {PERSIAN_DAYS.map((_, dayIndex) => {
                const entry = getClassesForPeriod(dayIndex, periodIndex);
                return (
                  <TouchableOpacity
                    key={`${dayIndex}-${periodIndex}`}
                    style={[
                      styles.gridCell,
                      styles.classCell,
                      entry && { backgroundColor: `${entry.color}20` },
                    ]}
                    onPress={() =>
                      entry && setSelectedDay(PERSIAN_DAYS[dayIndex])
                    }
                  >
                    {entry ? (
                      <View style={styles.gridClassContent}>
                        <Text
                          style={[styles.gridSubject, { color: entry.color }]}
                          numberOfLines={2}
                        >
                          {entry.subject}
                        </Text>
                        <Text style={styles.gridTeacher} numberOfLines={1}>
                          {entry.teacher}
                        </Text>
                        <Text style={styles.gridRoom} numberOfLines={1}>
                          {entry.room}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="برنامه هفتگی" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری برنامه...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const summary = timetableData?.summary || {
    totalClasses: 0,
    totalMinutes: 0,
    uniqueTeachers: 0,
    subjectsPerDay: {},
  };

  const entries = timetableData?.entries || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="برنامه هفتگی"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Class Info */}
        {timetableData?.classInfo?.className && (
          <View style={styles.classInfoContainer}>
            <Text style={styles.classInfoText}>
              {timetableData.classInfo.className}
              {timetableData.classInfo.section &&
                ` - ${timetableData.classInfo.section}`}
              {timetableData.classInfo.academicYear &&
                ` • ${timetableData.classInfo.academicYear}`}
            </Text>
          </View>
        )}

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              selectedDay === null && styles.viewToggleActive,
            ]}
            onPress={() => setSelectedDay(null)}
          >
            <Ionicons
              name="grid"
              size={20}
              color={selectedDay === null ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                selectedDay === null && styles.viewToggleTextActive,
              ]}
            >
              جدول
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              selectedDay !== null && styles.viewToggleActive,
            ]}
            onPress={() =>
              setSelectedDay(
                selectedDay !== null ? selectedDay : PERSIAN_DAYS[0],
              )
            }
          >
            <Ionicons
              name="list"
              size={20}
              color={selectedDay !== null ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                selectedDay !== null && styles.viewToggleTextActive,
              ]}
            >
              روزانه
            </Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
        >
          {PERSIAN_DAYS.map((day, index) => {
            const dayClasses = getClassesForDay(index);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayChip,
                  (selectedDay === null || selectedDay === day) &&
                    styles.dayChipActive,
                ]}
                onPress={() => {
                  if (selectedDay === day) {
                    setSelectedDay(null);
                  } else {
                    setSelectedDay(day);
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    (selectedDay === null || selectedDay === day) &&
                      styles.dayChipTextActive,
                  ]}
                >
                  {day}
                </Text>
                {dayClasses.length > 0 && (
                  <View style={styles.classCountBadge}>
                    <Text style={styles.classCountText}>
                      {dayClasses.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Timetable Content */}
        <View style={styles.timetableContainer}>
          {selectedDay === null ? (
            entries.length > 0 ? (
              <GridView />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={60}
                  color={Colors.textSecondary}
                />
                <Text style={styles.emptyStateText}>
                  برنامه هفتگی ثبت نشده است
                </Text>
              </View>
            )
          ) : (
            <DayView
              dayIndex={PERSIAN_DAYS.indexOf(selectedDay)}
              dayName={selectedDay}
            />
          )}
        </View>

        {/* Summary */}
        {entries.length > 0 && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>خلاصه هفته</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Ionicons name="book" size={20} color={Colors.primary} />
                <Text style={styles.summaryValue}>{summary.totalClasses}</Text>
                <Text style={styles.summaryLabel}>صنف کل</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="time" size={20} color={Colors.warning} />
                <Text style={styles.summaryValue}>{summary.totalMinutes}</Text>
                <Text style={styles.summaryLabel}>دقیقه صنف</Text>
              </View>
              <View style={styles.summaryStat}>
                <Ionicons name="school" size={20} color={Colors.success} />
                <Text style={styles.summaryValue}>
                  {summary.uniqueTeachers}
                </Text>
                <Text style={styles.summaryLabel}>معلم</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  classInfoContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classInfoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    margin: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  viewToggleTextActive: {
    color: "#fff",
  },
  daySelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  daySelectorContent: {
    gap: 8,
  },
  dayChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  dayChipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  classCountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  classCountText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  timetableContainer: {
    minHeight: 400,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  gridHeader: {
    flexDirection: "row",
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: "row",
    height: 80,
    marginBottom: 4,
  },
  gridCell: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeCell: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  dayHeaderCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  classCell: {
    flex: 1,
    padding: 4,
    backgroundColor: Colors.background,
  },
  timeText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
  },
  dayHeaderText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "bold",
  },
  gridClassContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gridSubject: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center",
  },
  gridTeacher: {
    fontSize: 8,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  gridRoom: {
    fontSize: 8,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  dayViewContainer: {
    paddingHorizontal: 16,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  classesCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyDay: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyDayText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  classCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  classDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryContainer: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryStat: {
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
