// components/grades/ResultSummaryCard.tsx
import { View, Text } from 'react-native';
import { ResultSummary } from '@/types/grades.types';

interface Props {
  summary: ResultSummary;
}

export function ResultSummaryCard({ summary }: Props) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <Text className="text-lg font-bold mb-4 dark:text-white">Class Performance</Text>
      
      <View className="space-y-3">
        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Average Score</Text>
            <Text className="font-bold dark:text-white">{summary.averageScore.toFixed(1)}</Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${Math.min(summary.averageScore, 100)}%` }}
            />
          </View>
        </View>

        <View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">Pass Rate</Text>
            <Text className="font-bold dark:text-white">{summary.passRate}%</Text>
          </View>
          <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <View 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${summary.passRate}%` }}
            />
          </View>
        </View>

        <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <View className="items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">Highest</Text>
            <Text className="text-green-600 dark:text-green-400 font-bold">{summary.highestScore}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">Lowest</Text>
            <Text className="text-red-600 dark:text-red-400 font-bold">{summary.lowestScore}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">Students</Text>
            <Text className="text-blue-600 dark:text-blue-400 font-bold">{summary.totalStudents}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}