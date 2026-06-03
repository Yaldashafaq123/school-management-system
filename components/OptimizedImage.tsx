// components/OptimizedImage.tsx
import React, { useState } from 'react';
import {
  Image,
  ImageProps,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  thumbnailUri?: string;
  placeholderColor?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  thumbnailUri,
  placeholderColor = Colors.border,
  style,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {isLoading && !hasError && (
        <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
      
      {hasError ? (
        <View style={[styles.errorContainer, { backgroundColor: placeholderColor }]} />
      ) : (
        <Image
          source={{ uri }}
          style={styles.image}
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          {...props}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
  },
});