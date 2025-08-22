import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import {
  ADVANCED_ANIMATION_CONFIG,
  animationComposers,
  ANIMATION_PRESETS,
  animationUtils,
} from '../../utils/advancedAnimations';

const { width: screenWidth } = Dimensions.get('window');

interface AnimatedCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  size?: 'small' | 'medium' | 'large';
  animationType?:
    | 'fadeIn'
    | 'slideUp'
    | 'slideLeft'
    | 'scale'
    | 'bounce'
    | 'flip';
  hoverEffect?: boolean;
  pressEffect?: boolean;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  badge?: string | number;
  badgeColor?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  onLongPress,
  style,
  titleStyle,
  subtitleStyle,
  variant = 'default',
  size = 'medium',
  animationType = 'fadeIn',
  hoverEffect = true,
  pressEffect = true,
  glowEffect = false,
  pulseEffect = false,
  disabled = false,
  loading = false,
  error = false,
  success = false,
  badge,
  badgeColor,
  icon,
  iconColor,
  iconSize = 24,
}) => {
  // 動畫值
  const opacityValue = useRef(new Animated.Value(0)).current;
  const translateYValue = useRef(new Animated.Value(50)).current;
  const translateXValue = useRef(new Animated.Value(50)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;

  // 狀態
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 入場動畫
  useEffect(() => {
    const preset = ANIMATION_PRESETS.card.enter;

    const animations: Animated.CompositeAnimation[] = [];

    switch (animationType) {
      case 'fadeIn':
        animations.push(
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: preset.duration,
            easing: preset.easing,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
            Animated.timing(translateYValue, {
              toValue: 0,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'slideLeft':
        animations.push(
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
            Animated.timing(translateXValue, {
              toValue: 0,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'scale':
        animations.push(
          Animated.parallel([
            Animated.timing(opacityValue, {
              toValue: 1,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
              toValue: 1,
              duration: preset.duration,
              easing: preset.easing,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'bounce':
        animations.push(
          animationComposers.successCelebration(
            scaleValue,
            rotateValue,
            opacityValue,
            preset.duration
          )
        );
        break;

      case 'flip':
        animations.push(
          animationComposers.cardFlip(rotateValue, scaleValue, preset.duration)
        );
        break;
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [animationType]);

  // 光暈效果
  useEffect(() => {
    if (glowEffect && !disabled) {
      const glowAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(glowValue, {
            toValue: 1,
            duration: 2000,
            easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
            useNativeDriver: false,
          }),
          Animated.timing(glowValue, {
            toValue: 0.3,
            duration: 2000,
            easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
            useNativeDriver: false,
          }),
        ])
      );
      glowAnimation.start();
      return () => glowAnimation.stop();
    }
  }, [glowEffect, disabled]);

  // 脈衝效果
  useEffect(() => {
    if (pulseEffect && !disabled) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.05,
            duration: 1000,
            easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 1000,
            easing: ADVANCED_ANIMATION_CONFIG.easing.smoothInOut,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [pulseEffect, disabled]);

  // 錯誤震動效果
  useEffect(() => {
    if (error) {
      const shakeAnimation = animationComposers.errorShake(shakeValue);
      shakeAnimation.start();
    }
  }, [error]);

  // 成功慶祝效果
  useEffect(() => {
    if (success) {
      const celebrationAnimation = animationComposers.successCelebration(
        scaleValue,
        rotateValue,
        opacityValue
      );
      celebrationAnimation.start();
    }
  }, [success]);

  // 處理按壓
  const handlePressIn = () => {
    if (!disabled && pressEffect) {
      setIsPressed(true);
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: ANIMATION_PRESETS.button.press.duration,
        easing: ANIMATION_PRESETS.button.press.easing,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (!disabled && pressEffect) {
      setIsPressed(false);
      Animated.timing(scaleValue, {
        toValue: isHovered ? 1.05 : 1,
        duration: ANIMATION_PRESETS.button.release.duration,
        easing: ANIMATION_PRESETS.button.release.easing,
        useNativeDriver: true,
      }).start();
    }
  };

  // 處理懸停
  const handleHoverIn = () => {
    if (!disabled && hoverEffect) {
      setIsHovered(true);
      Animated.timing(scaleValue, {
        toValue: 1.05,
        duration: ANIMATION_PRESETS.card.hover.duration,
        easing: ANIMATION_PRESETS.card.hover.easing,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleHoverOut = () => {
    if (!disabled && hoverEffect) {
      setIsHovered(false);
      Animated.timing(scaleValue, {
        toValue: isPressed ? 0.95 : 1,
        duration: ANIMATION_PRESETS.card.hover.duration,
        easing: ANIMATION_PRESETS.card.hover.easing,
        useNativeDriver: true,
      }).start();
    }
  };

  // 獲取變體樣式
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.background.tertiary,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 8,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.gold.primary,
        };
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        };
      default:
        return baseStyle;
    }
  };

  // 獲取尺寸樣式
  const getSizeStyles = (): ViewStyle => {
    const sizeMap = {
      small: { padding: theme.spacing.md, minHeight: 80 },
      medium: { padding: theme.spacing.lg, minHeight: 120 },
      large: { padding: theme.spacing.xl, minHeight: 160 },
    };
    return sizeMap[size];
  };

  // 獲取狀態樣式
  const getStatusStyles = (): ViewStyle => {
    if (loading) {
      return {
        borderColor: theme.colors.status.info,
        backgroundColor: theme.colors.background.secondary,
      };
    }
    if (error) {
      return {
        borderColor: theme.colors.status.error,
        backgroundColor: theme.colors.background.error,
      };
    }
    if (success) {
      return {
        borderColor: theme.colors.status.success,
        backgroundColor: theme.colors.background.success,
      };
    }
    if (disabled) {
      return {
        opacity: 0.5,
        backgroundColor: theme.colors.background.disabled,
      };
    }
    return {};
  };

  // 光暈插值
  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  // 旋轉插值
  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 震動插值
  const shakeTranslateX = shakeValue.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: [-10, 0, 10],
  });

  const cardContent = (
    <Animated.View
      style={[
        styles.container,
        getVariantStyles(),
        getSizeStyles(),
        getStatusStyles(),
        {
          opacity: opacityValue,
          transform: [
            { translateY: translateYValue },
            { translateX: translateXValue },
            { scale: scaleValue },
            { rotate },
            { translateX: shakeTranslateX },
          ],
        },
        style,
      ]}
    >
      {/* 光暈效果 */}
      {glowEffect && (
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              backgroundColor: theme.colors.gold.primary,
            },
          ]}
        />
      )}

      {/* 徽章 */}
      {badge && (
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeColor || theme.colors.gold.primary },
          ]}
        >
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}

      {/* 圖標 */}
      {icon && (
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={iconColor || theme.colors.gold.primary}
          />
        </View>
      )}

      {/* 標題 */}
      {title && <Text style={[styles.title, titleStyle]}>{title}</Text>}

      {/* 副標題 */}
      {subtitle && (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      )}

      {/* 內容 */}
      <View style={styles.content}>{children}</View>

      {/* 加載指示器 */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingSpinner,
              {
                borderColor: theme.colors.gold.primary,
                transform: [{ rotate }],
              },
            ]}
          />
        </View>
      )}

      {/* 狀態圖標 */}
      {error && (
        <View style={styles.statusIcon}>
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.colors.status.error}
          />
        </View>
      )}

      {success && (
        <View style={styles.statusIcon}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.status.success}
          />
        </View>
      )}
    </Animated.View>
  );

  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPressInCapture={handleHoverIn}
        onPressOutCapture={handleHoverOut}
        activeOpacity={1}
        disabled={disabled || loading}
        style={styles.touchable}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: theme.borderRadius.xl,
    zIndex: -1,
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    zIndex: 1,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  iconContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    zIndex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    right: theme.spacing.md,
    transform: [{ translateY: -10 }],
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRadius: theme.borderRadius.full,
  },
  statusIcon: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
});

// 預定義的動畫卡片組件
export const FadeInCard: React.FC<Omit<AnimatedCardProps, 'animationType'>> = (
  props
) => <AnimatedCard {...props} animationType="fadeIn" />;

export const SlideUpCard: React.FC<Omit<AnimatedCardProps, 'animationType'>> = (
  props
) => <AnimatedCard {...props} animationType="slideUp" />;

export const BounceCard: React.FC<Omit<AnimatedCardProps, 'animationType'>> = (
  props
) => <AnimatedCard {...props} animationType="bounce" />;

export const FlipCard: React.FC<Omit<AnimatedCardProps, 'animationType'>> = (
  props
) => <AnimatedCard {...props} animationType="flip" />;

export const GlowCard: React.FC<Omit<AnimatedCardProps, 'glowEffect'>> = (
  props
) => <AnimatedCard {...props} glowEffect={true} />;

export const PulseCard: React.FC<Omit<AnimatedCardProps, 'pulseEffect'>> = (
  props
) => <AnimatedCard {...props} pulseEffect={true} />;
