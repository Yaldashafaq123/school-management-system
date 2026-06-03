// components/grades/GradeInputRow.tsx
import { GradeEntry } from "@/types/grades.types";
import { Text, TextInput, View } from "react-native";

interface Props {
  entry: GradeEntry;
  index: number;
  onChange: (id: number, score: number | null) => void;
  onRemarks: (id: number) => void;
  isRTL?: boolean;
}

export function GradeInputRow({
  entry,
  index,
  onChange,
  onRemarks,
  isRTL = true,
}: Props) {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
      <Text className="w-12 text-gray-500 text-center">{index + 1}</Text>
      <Text
        className={`flex-1 ${isRTL ? "text-right" : "text-left"} dark:text-white`}
      >
        {entry.studentName}
      </Text>
      <TextInput
        className="w-20 h-10 bg-gray-50 dark:bg-gray-700 rounded-lg text-center dark:text-white border border-gray-200 dark:border-gray-600"
        keyboardType="numeric"
        value={entry.score?.toString() || ""}
        onChangeText={(text) => {
          const num = text ? parseFloat(text) : null;
          onChange(entry.studentId, num);
        }}
        maxLength={5}
        placeholder="-"
        placeholderTextColor="#9CA3AF"
      />
      <Text
        className="ml-3 text-blue-500 px-2"
        onPress={() => onRemarks(entry.studentId)}
      >
        💬
      </Text>
    </View>
  );
}
