import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle
} from 'react-native';
import { theme } from '../../theme/designSystem';

interface ProgressBarProps {
  progress: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold';
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'default',
  size = 'medium',
  showLabel = false,
  animated = true,
  style,
  labelStyle
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: Math.min(Math.max(progress, 0), 100),
        duration: 500,
        useNativeDriver: false
      }).start();
    } else {
      animatedProgress.setValue(Math.min(Math.max(progress, 0), 100));
    }
  }, [progress, animated]);

  const getSize = () => {
    const sizeMap = {
      small: { height: 4, fontSize: theme.typography.sizes.xs },
      medium: { height: 8, fontSize: theme.typography.sizes.sm },
      large: { height: 12, fontSize: theme.typography.sizes.base }
    };
    return sizeMap[size];
  };

  const getVariantColor = () => {
    const colorMap = {
      default: theme.colors.status.info,
      success: theme.colors.status.success,
      warning: theme.colors.status.warning,
      error: theme.colors.status.error,
      gold: theme.colors.gold.primary
    };
    return colorMap[variant];
  };

  const getProgressWidth = () => {
    return animatedProgress.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%']
    });
  };

  const getProgressText = () => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    return `${Math.round(clampedProgress)}%`;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height: getSize().height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: getVariantColor(),
              width: getProgressWidth(),
              height: getSize().height
            }
          ]}
        />
      </View>
      {showLabel && (
        <Text
          style={[
            styles.label,
            { fontSize: getSize().fontSize },
            labelStyle
          ]}
        >
          {getProgressText()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  track: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.primary
  },
  fill: {
    borderRadius: theme.borderRadius.full
  },
  label: {
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.medium
  }
});
