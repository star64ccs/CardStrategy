import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';

interface ScreenReaderProps {
  text: string;
  priority?: 'high' | 'normal' | 'low';
  children?: React.ReactNode;
}

const ScreenReader: React.FC<ScreenReaderProps> = ({
  text,
  priority = 'normal',
  children,
}) => {
  const { isScreenReaderEnabled } = useAccessibility();

  if (!isScreenReaderEnabled) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <Text
        style={styles.srOnly}
        accessibilityRole="text"
        accessibilityLabel={text}
        accessibilityLiveRegion={priority === 'high' ? 'assertive' : 'polite'}
      >
        {text}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  srOnly: {
    position: 'absolute',
    left: -10000,
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
});

export default ScreenReader;
