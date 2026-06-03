
// components/grades/EmptyState.tsx
import { View, Text } from 'react-native';

interface Props {
  message?: string;
  icon?: string;
}

export function EmptyState({ message = 'No data available', icon = '📭' }: Props) {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-lg text-center">
        {message}
      </Text>
    </View>
  );
}