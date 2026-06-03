// components/grades/ErrorState.tsx
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: Props) {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <Text className="text-6xl mb-4">⚠️</Text>
      <Text className="text-red-500 text-lg text-center mb-4">{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg"
          onPress={onRetry}
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}