// components/RTLView.tsx
import React from 'react';
import { 
  View, 
  ViewProps, 
  StyleSheet, 
  I18nManager, 
  Text, 
  TextProps, 
  Image, 
  ImageProps 
} from 'react-native';

interface RTLViewProps extends ViewProps {
  children?: React.ReactNode;
}

export const RTLView: React.FC<RTLViewProps> = ({ style, children, ...props }) => {
  const rtlStyle = I18nManager.isRTL ? styles.rtl : styles.ltr;

  return (
    <View style={[rtlStyle, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  rtl: {
    direction: 'rtl',
  },
  ltr: {
    direction: 'ltr',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  rtlImage: {
    transform: [{ scaleX: -1 }],
  },
  ltrImage: {
    transform: [{ scaleX: 1 }],
  },
});

// RTL-aware Text component
export const RTLText: React.FC<TextProps> = ({ style, children, ...props }) => {
  const textStyle = I18nManager.isRTL ? styles.rtlText : styles.ltrText;

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

// RTL-aware Image component
export const RTLImage: React.FC<ImageProps> = ({ style, ...props }) => {
  const imageStyle = I18nManager.isRTL ? styles.rtlImage : styles.ltrImage;

  return (
    <Image style={[imageStyle, style]} {...props} />
  );
};