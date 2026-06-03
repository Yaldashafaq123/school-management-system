// components/VirtualizedList.tsx
import React, { memo, useCallback, ReactElement } from 'react';
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  ViewToken,
} from 'react-native';

interface VirtualizedListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'onViewableItemsChanged'> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onViewableItemsChanged?: (info: { viewableItems: ViewToken<T>[]; changed: ViewToken<T>[] }) => void;
}

const VirtualizedListComponent = <T,>({
  data,
  renderItem,
  keyExtractor,
  onViewableItemsChanged,
  ...props
}: VirtualizedListProps<T>) => {
  
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken<T>[]; changed: ViewToken<T>[] }) => {
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
    },
    [onViewableItemsChanged]
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      windowSize={5}
      removeClippedSubviews={true}
      initialNumToRender={5}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      {...props}
    />
  );
};

// Create the memoized component with proper typing
export const VirtualizedList = memo(VirtualizedListComponent) as <T>(
  props: VirtualizedListProps<T>
) => ReactElement;

// Type assertion to add displayName
(VirtualizedList as any).displayName = 'VirtualizedList';