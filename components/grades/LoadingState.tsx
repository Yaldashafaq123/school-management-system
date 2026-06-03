// components/grades/LoadingState.tsx
import { View, ActivityIndicator, Text } from 'react-native';

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: Props) {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 dark:text-gray-400 mt-4">{message}</Text>
    </View>
  );
}