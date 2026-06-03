import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Filter {
  id: string;
  label: string;
}

interface FilterBarProps {
  filters: Filter[];
  selectedFilter: string;
  onFilterSelect: (filterId: string) => void;
}

export function FilterBar({ filters, selectedFilter, onFilterSelect }: FilterBarProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            selectedFilter === filter.id && styles.filterButtonActive
          ]}
          onPress={() => onFilterSelect(filter.id)}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === filter.id && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
});