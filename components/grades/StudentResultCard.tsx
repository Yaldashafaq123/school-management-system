// components/grades/StudentResultCard.tsx
import { View, Text } from 'react-native';
import { StudentResult } from '@/types/grades.types';

interface Props {
  result: StudentResult;
  onPress?: () => void;
}

export function StudentResultCard({ result, onPress }: Props) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-3">
        <View>
          <Text className="text-lg font-bold dark:text-white">{result.student.fullName}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Rank: #{result.rank}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          result.status === 'PASSED' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
        }`}>
          <Text className={`font-bold ${
            result.status === 'PASSED' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
          }`}>
            {result.status}
          </Text>
        </View>
      </View>

      <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Percentage</Text>
          <Text className="font-bold dark:text-white">{result.percentage}%</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-600 dark:text-gray-400">Grade</Text>
          <Text className="font-bold dark:text-white">{result.grade}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-gray-600 dark:text-gray-400">Total</Text>
          <Text className="font-bold dark:text-white">{result.totalMarks}</Text>
        </View>
      </View>

      {result.grades.slice(0, 3).map((grade, index) => (
        <View key={index} className="flex-row justify-between mt-2">
          <Text className="text-gray-600 dark:text-gray-400">{grade.subject}</Text>
          <Text className="font-medium dark:text-white">{grade.marks}</Text>
        </View>
      ))}
    </View>
  );
}