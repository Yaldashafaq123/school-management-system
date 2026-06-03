// components/grades/SupervisorEvaluationTable.tsx
import { View, Text, TextInput, ScrollView } from 'react-native';
import { SupervisorEvaluation } from '@/types/grades.types';

interface Props {
  evaluations: SupervisorEvaluation[];
  onUpdate: (studentId: number, field: keyof SupervisorEvaluation, value: any) => void;
}

export function SupervisorEvaluationTable({ evaluations, onUpdate }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
      <View>
        {/* Table Header */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800">
          <View className="w-40 p-3 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-bold dark:text-white text-sm">Student Name</Text>
          </View>
          <View className="w-24 p-3 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-bold dark:text-white text-sm text-center">Behavior</Text>
          </View>
          <View className="w-24 p-3 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-bold dark:text-white text-sm text-center">Discipline</Text>
          </View>
          <View className="w-24 p-3 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-bold dark:text-white text-sm text-center">Attendance</Text>
          </View>
          <View className="w-28 p-3 border-r border-gray-200 dark:border-gray-700">
            <Text className="font-bold dark:text-white text-sm text-center">Participation</Text>
          </View>
          <View className="w-48 p-3">
            <Text className="font-bold dark:text-white text-sm">Comments</Text>
          </View>
        </View>

        {/* Table Body */}
        <ScrollView>
          {evaluations.map((evaluation) => (
            <View key={evaluation.studentId} className="flex-row border-b border-gray-200 dark:border-gray-700">
              <View className="w-40 p-3 border-r border-gray-200 dark:border-gray-700 justify-center">
                <Text className="dark:text-white text-sm" numberOfLines={2}>
                  {evaluation.studentName}
                </Text>
              </View>
              <View className="w-24 p-2 border-r border-gray-200 dark:border-gray-700 justify-center">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 p-1 rounded text-center text-sm dark:text-white"
                  keyboardType="numeric"
                  value={evaluation.behaviorScore?.toString() || ''}
                  onChangeText={(text) => onUpdate(evaluation.studentId, 'behaviorScore', Number(text) || 0)}
                  maxLength={3}
                />
              </View>
              <View className="w-24 p-2 border-r border-gray-200 dark:border-gray-700 justify-center">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 p-1 rounded text-center text-sm dark:text-white"
                  keyboardType="numeric"
                  value={evaluation.disciplineScore?.toString() || ''}
                  onChangeText={(text) => onUpdate(evaluation.studentId, 'disciplineScore', Number(text) || 0)}
                  maxLength={3}
                />
              </View>
              <View className="w-24 p-2 border-r border-gray-200 dark:border-gray-700 justify-center">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 p-1 rounded text-center text-sm dark:text-white"
                  keyboardType="numeric"
                  value={evaluation.attendanceScore?.toString() || ''}
                  onChangeText={(text) => onUpdate(evaluation.studentId, 'attendanceScore', Number(text) || 0)}
                  maxLength={3}
                />
              </View>
              <View className="w-28 p-2 border-r border-gray-200 dark:border-gray-700 justify-center">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 p-1 rounded text-center text-sm dark:text-white"
                  keyboardType="numeric"
                  value={evaluation.participationScore?.toString() || ''}
                  onChangeText={(text) => onUpdate(evaluation.studentId, 'participationScore', Number(text) || 0)}
                  maxLength={3}
                />
              </View>
              <View className="w-48 p-2 justify-center">
                <TextInput
                  className="bg-gray-50 dark:bg-gray-700 p-1 rounded text-sm dark:text-white"
                  value={evaluation.comments}
                  onChangeText={(text) => onUpdate(evaluation.studentId, 'comments', text)}
                  multiline
                  numberOfLines={2}
                  placeholder="Add comment..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}