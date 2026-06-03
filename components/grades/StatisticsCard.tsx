// components/grades/StatisticsCard.tsx
import { Text, View } from "react-native";

interface Props {
  title: string;
  value: string | number;
  icon?: string;
  color?: string;
}

export function StatisticsCard({
  title,
  value,
  icon,
  color = "#3B82F6",
}: Props) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm flex-1 min-w-[150px]">
      <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">
        {title}
      </Text>
      <Text className="text-2xl font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
