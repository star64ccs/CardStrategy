import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from 'react-native';
import { theme } from '../../theme/designSystem';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'gold';
  style?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  disabled = false,
  size = 'medium',
  variant = 'default',
  style,
}) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const getSize = () => {
    const sizeMap = {
      small: { width: 32, height: 18, thumbSize: 14 },
      medium: { width: 44, height: 24, thumbSize: 20 },
      large: { width: 56, height: 30, thumbSize: 26 },
    };
    return sizeMap[size];
  };

  const getVariantColor = () => {
    const colorMap = {
      default: theme.colors.status.info,
      success: theme.colors.status.success,
      warning: theme.colors.status.warning,
      error: theme.colors.status.error,
      gold: theme.colors.gold.primary,
    };
    return colorMap[variant];
  };

  const handlePress = () => {
    if (disabled) return;

    // 添加按壓動畫
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(!value);
  };

  const trackWidth = getSize().width;
  const trackHeight = getSize().height;
  const { thumbSize } = getSize();
  const thumbTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, trackWidth - thumbSize - 2],
  });

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: trackWidth,
            height: trackHeight,
            backgroundColor: value
              ? getVariantColor()
              : theme.colors.background.secondary,
            borderColor: value
              ? getVariantColor()
              : theme.colors.border.primary,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              transform: [{ translateX: thumbTranslateX }],
              backgroundColor: value
                ? theme.colors.text.primary
                : theme.colors.text.tertiary,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
  },
  thumb: {
    borderRadius: theme.borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
