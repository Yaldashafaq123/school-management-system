// app/(teacher)/classes/index.tsx
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { classApi, ClassItem, getSubjectColor } from "@/src/config/classApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyClassesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalClasses: 0,
    supervised: 0,
    teaching: 0,
  });

  const fetchClasses = useCallback(async () => {
    try {
      const response = await classApi.getMyClasses();
      if (response.success) {
        setClasses(response.data);
        if (response.summary) {
          setSummary(response.summary);
        }
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      Alert.alert("خطا", "خطا در دریافت لیست صنف ها");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() =>
        router.push({
          pathname: "/(teacher)/classes/[id]",
          params: { id: item.id },
        })
      }
    >
      <View style={styles.classHeader}>
        <View
          style={[
            styles.subjectIcon,
            { backgroundColor: getSubjectColor(item.subject) },
          ]}
        >
          <Text style={styles.subjectInitial}>{item.subject.charAt(0)}</Text>
        </View>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classGrade}>{item.grade}</Text>
          {item.section && (
            <Text style={styles.classSection}>بخش {item.section}</Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={24}
          color={Colors.textSecondary}
        />
      </View>

      <View style={styles.classFooter}>
        <View style={styles.statsContainer}>
          <Ionicons
            name="people-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.statsText}>{item.students} دانش‌آموز</Text>
        </View>
        <View style={styles.statsContainer}>
          <Ionicons
            name="book-outline"
            size={16}
            color={Colors.textSecondary}
          />
          <Text style={styles.statsText}>
            {item.role === "supervisor" ? "مدیر صنف" : "مدرس"}
          </Text>
        </View>
        {item.role === "supervisor" && (
          <View style={styles.roleBadge}>
            <Ionicons name="star" size={12} color="#fff" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>هیچ صنفی یافت نشد</Text>
      <Text style={styles.emptyText}>
        شما در حال حاضر در هیچ صنف تدریس نمی‌کنید یا به عنوان استاد راهنما
        نیستید.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>صنف های من</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری ها...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>صنف های من</Text>
        {classes.length > 0 && (
          <View style={styles.headerStats}>
            <Text style={styles.subtitle}>مجموع: {classes.length} کلاس</Text>
            {summary.supervised > 0 && (
              <Text style={styles.badgeText}>{summary.supervised} مدیر</Text>
            )}
            {summary.teaching > 0 && (
              <Text style={[styles.badgeText, styles.teachingBadge]}>
                {summary.teaching} مدرس
              </Text>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={classes}
        renderItem={renderClassItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          classes.length === 0 && styles.emptyListContainer,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "right",
  },
  headerStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  badgeText: {
    fontSize: 14,
    color: Colors.primary,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  teachingBadge: {
    color: Colors.success,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
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
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  classCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  subjectInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "right",
  },
  classGrade: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  classSection: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    textAlign: "right",
  },
  classFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsText: {
    marginRight: 6,
    color: Colors.textSecondary,
    fontSize: 14,
  },
  roleBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
