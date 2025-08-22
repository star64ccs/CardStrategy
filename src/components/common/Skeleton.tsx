import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '@/config/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'image';
  lines?: number;
  spacing?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius = 4,
  style,
  variant = 'text',
  lines = 1,
  spacing = 8,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const getVariantStyles = (): { width: number | string; height: number } => {
    switch (variant) {
      case 'title':
        return { width: width || '60%', height: height || 24 };
      case 'avatar':
        return { width: width || 40, height: height || 40 };
      case 'card':
        return { width: width || '100%', height: height || 120 };
      case 'button':
        return { width: width || 100, height: height || 40 };
      case 'image':
        return { width: width || '100%', height: height || 200 };
      case 'text':
      default:
        return { width: width || '100%', height: height || 16 };
    }
  };

  const getVariantBorderRadius = (): number => {
    switch (variant) {
      case 'avatar':
        return (height || 40) / 2;
      case 'card':
        return 8;
      case 'button':
        return 20;
      case 'image':
        return 4;
      default:
        return borderRadius;
    }
  };

  const variantStyles = getVariantStyles();
  const variantBorderRadius = getVariantBorderRadius();

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (lines > 1) {
    return (
      <View style={styles.container}>
        {Array.from({ length: lines }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.skeleton,
              {
                width: variantStyles.width,
                height: variantStyles.height,
                borderRadius: variantBorderRadius,
                opacity,
                marginBottom: index < lines - 1 ? spacing : 0,
              },
              style,
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: variantStyles.width,
          height: variantStyles.height,
          borderRadius: variantBorderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeleton: {
    backgroundColor: theme.colors.backgroundPaper,
  },
});

// 預定義的骨架屏組件
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="text" {...props} />;

export const SkeletonTitle: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="title" {...props} />;

export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="avatar" {...props} />;

export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="card" {...props} />;

export const SkeletonButton: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="button" {...props} />;

export const SkeletonImage: React.FC<Omit<SkeletonProps, 'variant'>> = (
  props
) => <Skeleton variant="image" {...props} />;
