import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { taqwimApi, TaqwimEvent } from "@/src/config/taqwimApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const AFGHAN_MONTHS = [
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

const PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

type DayEvent = {
  day: number;
  events: TaqwimEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
};

export default function CalendarScreen() {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [currentYear, setCurrentYear] = useState(1403);
  const [currentMonth, setCurrentMonth] = useState(0);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [events, setEvents] = useState<TaqwimEvent[]>([]);
  const [calendarDays, setCalendarDays] = useState<DayEvent[]>([]);

  // REAL TODAY (simple fallback logic)
  const today = new Date().getDate();

  useEffect(() => {
    loadEvents();
  }, [currentYear, currentMonth]);

  useEffect(() => {
    generateCalendarDays();
  }, [events, currentMonth]);

  const loadEvents = async () => {
    const response = await taqwimApi.getMonthEvents(
      currentYear,
      currentMonth + 1,
    );

    if (response.success) {
      setEvents(response.data);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  const getMonthLength = (month: number) => {
    if (month <= 5) return 31;
    if (month <= 10) return 30;
    return 29;
  };

  const generateCalendarDays = () => {
    const days: DayEvent[] = [];
    const daysInMonth = getMonthLength(currentMonth);
    const firstDayOffset = 2;

    for (let i = 0; i < 35; i++) {
      const dayNumber = i - firstDayOffset + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;

      const dayEvents = events.filter((e) => {
        const parts = e.date?.split("/");
        const eventDay = parseInt(parts?.[parts.length - 1] || "0");
        return eventDay === dayNumber;
      });

      days.push({
        day: dayNumber,
        events: isCurrentMonth ? dayEvents : [],
        isToday: dayNumber === today,
        isCurrentMonth,
      });
    }

    setCalendarDays(days);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getEventColor = (type?: string) => {
    switch (type) {
      case "exam":
        return Colors.warning;
      case "assignment":
        return Colors.primary;
      case "holiday":
        return "red";
      default:
        return Colors.info;
    }
  };

  const selectedDayEvents = selectedDay
    ? events.filter((e) => {
        const parts = e.date?.split("/");
        return parseInt(parts?.[parts.length - 1]) === selectedDay;
      })
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="تقویم" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={handlePrevMonth}>
            <Ionicons name="chevron-forward" size={24} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {AFGHAN_MONTHS[currentMonth]} {currentYear}
          </Text>

          <TouchableOpacity onPress={handleNextMonth}>
            <Ionicons name="chevron-back" size={24} />
          </TouchableOpacity>
        </View>

        {/* Weekdays */}
        <View style={styles.weekRow}>
          {PERSIAN_WEEKDAYS.map((d, i) => (
            <Text key={i} style={styles.weekDay}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.grid}>
          {calendarDays.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                day.isToday && styles.today,
                selectedDay === day.day && styles.selected,
              ]}
              onPress={() => day.isCurrentMonth && setSelectedDay(day.day)}
            >
              <Text style={styles.dayText}>
                {day.isCurrentMonth ? day.day : ""}
              </Text>

              {day.events.length > 0 && (
                <View style={styles.dotRow}>
                  {day.events.slice(0, 3).map((e, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.dot,
                        { backgroundColor: getEventColor(e.type) },
                      ]}
                    />
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Events */}
        {selectedDay && (
          <View style={styles.eventsBox}>
            <Text style={styles.eventsTitle}>
              رویدادهای {selectedDay} {AFGHAN_MONTHS[currentMonth]}
            </Text>

            {selectedDayEvents.map((e) => (
              <TouchableOpacity
                key={e.id}
                style={styles.eventCard}
                onPress={() => router.push(`/event/${e.id}`)}
              >
                <Text style={styles.eventText}>{e.title}</Text>
                <Text style={styles.eventType}>{e.type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  monthTitle: { fontSize: 18, fontWeight: "bold" },

  weekRow: { flexDirection: "row" },
  weekDay: { flex: 1, textAlign: "center" },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: width / 7,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  today: { backgroundColor: "#dff0ff" },
  selected: { backgroundColor: "#007bff" },

  dayText: { fontSize: 14 },

  dotRow: { flexDirection: "row", gap: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },

  eventsBox: { padding: 16 },
  eventsTitle: { fontWeight: "bold", marginBottom: 10 },

  eventCard: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    marginBottom: 8,
    borderRadius: 8,
  },
  eventText: { fontWeight: "600" },
  eventType: { fontSize: 12, color: "gray" },
});
