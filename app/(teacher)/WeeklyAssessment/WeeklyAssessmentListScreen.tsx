// app/(teacher)/WeeklyAssessment/WeeklyAssessmentListScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { apiRequest } from "../../../src/config/api";

interface AssessmentResult {
  studentId: number;
  studentName: string;
  marks: number;
  percentage: number;
  feedback: string | null;
}

interface Assessment {
  id: number;
  title: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  weekNumber: number;
  maxMarks: number;
  totalStudents: number;
  averageMarks: number;
  createdAt: string;
  results: AssessmentResult[];
}

interface Class {
  id: number;
  name: string;
  section: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function WeeklyAssessmentListScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);

  const fetchClasses = async () => {
    try {
      const response = await apiRequest("/teacher/classes");
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiRequest("/teacher/subjects");
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      let url = "/teacher/weekly-assessments";
      const params: string[] = [];
      if (selectedClass) params.push(`classId=${selectedClass}`);
      if (selectedSubject) params.push(`subjectId=${selectedSubject}`);
      if (params.length) url += `?${params.join("&")}`;

      const response = await apiRequest(url);
      if (response.success && response.data) {
        setAssessments(response.data);
      } else {
        Alert.alert(
          "خطا",
          response.message || "مشکلی در بارگذاری ارزیابی‌ها پیش آمد",
        );
      }
    } catch (error) {
      console.error("Error fetching assessments:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری ارزیابی‌ها پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [selectedClass, selectedSubject]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssessments();
  };

  const handleCreatePress = () => {
    router.push("./CreateWeeklyAssessmentScreen");
  };

  const handleAssessmentPress = (assessment: Assessment) => {
    router.push({
      pathname: "./WeeklyAssessmentDetailScreen",
      params: { assessmentId: assessment.id.toString() },
    });
  };

  const handleFilterClass = (classId: number | null) => {
    setSelectedClass(classId);
  };

  const handleFilterSubject = (subjectId: number | null) => {
    setSelectedSubject(subjectId);
  };

  const renderAssessmentItem = ({ item }: { item: Assessment }) => (
    <TouchableOpacity
      style={styles.assessmentCard}
      onPress={() => handleAssessmentPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <View style={styles.weekBadge}>
            <Text style={styles.weekBadgeText}>هفته {item.weekNumber}</Text>
          </View>
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.textSecondary}
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardInfo}>
          <Ionicons
            name="book-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.cardInfoText}>{item.subjectName}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Ionicons
            name="people-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.cardInfoText}>
            {item.totalStudents} دانش‌آموز
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Ionicons
            name="star-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.cardInfoText}>
            میانگین: {item.averageMarks || 0} / {item.maxMarks}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString("fa-IR")}
        </Text>
        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  item.totalStudents > 0 ? Colors.success : Colors.warning,
              },
            ]}
          />
          <Text style={styles.statusText}>
            {item.totalStudents > 0 ? "تکمیل شده" : "در انتظار"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری ارزیابی‌ها...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="ارزیابی‌های هفتگی"
        rightComponent={
          <TouchableOpacity onPress={handleCreatePress}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Class Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedClass && styles.filterChipActive,
            ]}
            onPress={() => handleFilterClass(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedClass && styles.filterChipTextActive,
              ]}
            >
              همه کلاس‌ها
            </Text>
          </TouchableOpacity>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.id}
              style={[
                styles.filterChip,
                selectedClass === cls.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilterClass(cls.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedClass === cls.id && styles.filterChipTextActive,
                ]}
              >
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subject Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedSubject && styles.filterChipActive,
            ]}
            onPress={() => handleFilterSubject(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedSubject && styles.filterChipTextActive,
              ]}
            >
              همه دروس
            </Text>
          </TouchableOpacity>
          {subjects.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.filterChip,
                selectedSubject === sub.id && styles.filterChipActive,
              ]}
              onPress={() => handleFilterSubject(sub.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedSubject === sub.id && styles.filterChipTextActive,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Assessment List */}
        <FlatList
          data={assessments}
          renderItem={renderAssessmentItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>هیچ ارزیابی وجود ندارد</Text>
              <Text style={styles.emptyText}>
                برای ایجاد ارزیابی جدید، دکمه + را بزنید
              </Text>
            </View>
          )}
          contentContainerStyle={[
            styles.listContent,
            assessments.length === 0 && styles.emptyListContent,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
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
    paddingHorizontal: 16,
  },
  filterContainer: {
    paddingVertical: 10,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  assessmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  weekBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  weekBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  cardBody: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    gap: 12,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
