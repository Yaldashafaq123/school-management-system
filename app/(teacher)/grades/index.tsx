// app/(tabs)/grades/index.tsx - Dashboard
import { ErrorState } from "@/components/grades/ErrorState";
import { LoadingState } from "@/components/grades/LoadingState";
import { StatisticsCard } from "@/components/grades/StatisticsCard";
import { useDashboardStats } from "@/hooks/useGrades";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function GradesDashboard() {
  const { data: stats, loading, error, refetch } = useDashboardStats();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const quickActions = [
    {
      title: "Enter Monthly Grades",
      icon: "📝",
      route: "/grades/enter-grades?type=MONTHLY",
    },
    {
      title: "Enter Half-Year Grades",
      icon: "📊",
      route: "/grades/enter-grades?type=HALF_YEARLY",
    },
    {
      title: "Enter Final Grades",
      icon: "🏆",
      route: "/grades/enter-grades?type=FINAL",
    },
    { title: "View Results", icon: "📋", route: "/grades/results" },
    {
      title: "Supervisor Evaluation",
      icon: "⭐",
      route: "/grades/supervisor-evaluation",
    },
    { title: "Report Cards", icon: "📄", route: "/grades/report-cards" },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6 dark:text-white">
          Grades Dashboard
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatisticsCard
            title="Total Classes"
            value={stats?.totalClasses || 0}
            color="#3B82F6"
          />
          <StatisticsCard
            title="Total Subjects"
            value={stats?.totalSubjects || 0}
            color="#10B981"
          />
        </View>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatisticsCard
            title="Pending Grades"
            value={stats?.pendingGrades || 0}
            color="#F59E0B"
          />
          <StatisticsCard
            title="Published"
            value={stats?.publishedResults || 0}
            color="#8B5CF6"
          />
        </View>

        <View className="flex-row flex-wrap gap-3 mb-6">
          <StatisticsCard
            title="Awaiting Grading"
            value={stats?.studentsAwaiting || 0}
            color="#EF4444"
          />
        </View>

        <Text className="text-lg font-semibold mb-4 dark:text-white">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm w-[47%]"
              onPress={() => router.push(action.route as any)}
            >
              <Text className="text-2xl mb-2">{action.icon}</Text>
              <Text className="text-sm font-medium dark:text-white">
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
