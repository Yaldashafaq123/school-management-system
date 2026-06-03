// components/grades/GradeTable.tsx
import { GradeEntry } from "@/types/grades.types";
import { ScrollView, Text, View } from "react-native";
import { GradeInputRow } from "./GradeInputRow";

interface Props {
  entries: GradeEntry[];
  onGradeChange: (studentId: number, score: number | null) => void;
  onRemarks: (studentId: number) => void;
}

export function GradeTable({ entries, onGradeChange, onRemarks }: Props) {
  const completed = entries.filter((e) => e.score !== null).length;

  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        {entries.map((entry, index) => (
          <GradeInputRow
            key={entry.studentId}
            entry={entry}
            index={index}
            onChange={onGradeChange}
            onRemarks={onRemarks}
          />
        ))}
      </ScrollView>

      <View className="flex-row justify-between p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <View>
          <Text className="text-gray-500 text-sm">Total: {entries.length}</Text>
        </View>
        <View>
          <Text className="text-green-500 text-sm">Completed: {completed}</Text>
        </View>
        <View>
          <Text className="text-red-500 text-sm">
            Missing: {entries.length - completed}
          </Text>
        </View>
      </View>
    </View>
  );
}
