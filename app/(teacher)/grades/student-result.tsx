// app/(tabs)/grades/student-result.tsx - Student Result Details
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useStudentResult } from '@/hooks/useGrades';
import { LoadingState } from '@/components/grades/LoadingState';
import { ErrorState } from '@/components/grades/ErrorState';

export default function StudentResult() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: result, loading } = useStudentResult(Number(id));

  if (loading) return <LoadingState />;
  if (!result) return <ErrorState message="No result found" />;

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Student Profile Header */}
      <View className="bg-blue-500 p-6 items-center">
        <View className="w-20 h-20 bg-white rounded-full mb-3" />
        <Text className="text-white text-xl font-bold">{result.student.fullName}</Text>
        <Text className="text-white opacity-80">ID: {result.student.studentId}</Text>
      </View>

      {/* Academic Results */}
      <View className="p-4">
        <Text className="text-lg font-bold mb-3 dark:text-white">Subject Results</Text>
        {result.grades.map((grade, index) => (
          <View key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-2 flex-row justify-between">
            <View>
              <Text className="font-medium dark:text-white">{grade.subject}</Text>
              {grade.feedback && <Text className="text-gray-500 text-sm">{grade.feedback}</Text>}
            </View>
            <Text className="text-lg font-bold dark:text-white">{grade.marks}</Text>
          </View>
        ))}
      </View>

      {/* Summary */}
      <View className="p-4">
        <Text className="text-lg font-bold mb-3 dark:text-white">Summary</Text>
        <View className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Total Marks</Text>
            <Text className="font-bold dark:text-white">{result.totalMarks}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Percentage</Text>
            <Text className="font-bold dark:text-white">{result.percentage}%</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Grade</Text>
            <Text className="font-bold dark:text-white">{result.grade}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600 dark:text-gray-400">Rank</Text>
            <Text className="font-bold dark:text-white">#{result.rank}</Text>
          </View>
          <View className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <View className={`self-start px-3 py-1 rounded ${result.status === 'PASSED' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`font-bold ${result.status === 'PASSED' ? 'text-green-700' : 'text-red-700'}`}>
                {result.status}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}