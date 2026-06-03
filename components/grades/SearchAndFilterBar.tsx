// components/grades/SearchAndFilterBar.tsx
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
  placeholder?: string;
  filters?: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
}

export function SearchAndFilterBar({ onSearch, placeholder = 'Search...', filters }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <View>
      <View className="flex-row items-center gap-2 mb-2">
        <View className="flex-1">
          <TextInput
            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg dark:text-white"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            onChangeText={onSearch}
          />
        </View>
        {filters && filters.length > 0 && (
          <TouchableOpacity
            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text className="dark:text-white">🔍</Text>
          </TouchableOpacity>
        )}
      </View>

      {showFilters && filters && (
        <View className="flex-row flex-wrap gap-2 mb-2">
          {filters.map((filter, index) => (
            <View key={index} className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
              <Text className="text-sm text-gray-500 dark:text-gray-400 mr-2">{filter.label}:</Text>
              {filter.options.map(option => (
                <TouchableOpacity
                  key={option.value}
                  className={`px-3 py-1 rounded ${
                    filter.value === option.value 
                      ? 'bg-blue-500' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  } mr-1`}
                  onPress={() => filter.onChange(option.value)}
                >
                  <Text className={`text-sm ${
                    filter.value === option.value 
                      ? 'text-white' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}