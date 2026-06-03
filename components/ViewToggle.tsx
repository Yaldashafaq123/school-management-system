// components/ViewToggle.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === 'grid' && styles.buttonActive]}
        onPress={() => onModeChange('grid')}
      >
        <Ionicons
          name="grid"
          size={20}
          color={mode === 'grid' ? Colors.primary : Colors.text}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, mode === 'list' && styles.buttonActive]}
        onPress={() => onModeChange('list')}
      >
        <Ionicons
          name="list"
          size={20}
          color={mode === 'list' ? Colors.primary : Colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});