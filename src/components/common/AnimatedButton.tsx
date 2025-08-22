import React, { useRef, ReactNode, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import {
  ADVANCED_ANIMATION_CONFIG,
  animationComposers,
  ANIMATION_PRESETS,
  animationUtils,
} from '../../utils/advancedAnimations';

export interface AnimatedButtonProps {
  children: ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  activeOpacity?: number;
  scaleOnPress?: boolean;
  rippleEffect?: boolean;
  animationDuration?: number;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'danger'
    | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconSize?: number;
  iconColor?: string;
  badge?: string | number;
  badgeColor?: string;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  shakeOnError?: boolean;
  successAnimation?: boolean;
  errorAnimation?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onPress,
  style,
  textStyle,
  disabled = false,
  activeOpacity = 0.8,
  scaleOnPress = true,
  rippleEffect = false,
  animationDuration = 150,
  variant = 'default',
  size = 'medium',
  loading = false,
  icon,
  iconPosition = 'left',
  iconSize = 20,
  iconColor,
  badge,
  badgeColor,
  glowEffect = false,
  pulseEffect = false,
  shakeOnError = false,
  successAnimation = false,
  errorAnimation = false,
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rippleValue = useRef(new Animated.Value(0)).current;
  const glowValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const shakeValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const loadingValue = useRef(new Animated.Value(0)).current;

  const [isPressed, setIsPressed] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // 加載動畫
  useEffect(() => {
    if (loading) {
      const loadingAnimation = Animated.loop(
        Animated.timing(loadingValue, {
          toValue: 1,
          duration: 1000,
          easing: ADVANCED_ANIMATION_CONFIG.easing.easeInOut,
          useNativeDriver: true,
        })
      );
      loadingAnimation.start();
      return () => loadingAnimation.stop();
    }
  }, [loading]);

  // 錯誤動畫
  useEffect(() => {
    if (errorAnimation && isError) {
      const shakeAnimation = animationComposers.errorShake(shakeValue);
      shakeAnimation.start(() => {
        setIsError(false);
      });
    }
  }, [errorAnimation, isError]);

  // 成功動畫
  useEffect(() => {
    if (successAnimation && isSuccess) {
      const successAnimation = animationComposers.successCelebration(
        scaleValue,
        rotateValue,
        glowValue
      );
      successAnimation.start(() => {
        setIsSuccess(false);
      });
    }
  }, [successAnimation, isSuccess]);

  const handlePressIn = () => {
    if (scaleOnPress && !disabled && !loading) {
      setIsPressed(true);
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: ANIMATION_PRESETS.button.press.duration,
        easing: ANIMATION_PRESETS.button.press.easing,
        useNativeDriver: true,
      }).start();
    }

    if (rippleEffect && !disabled && !loading) {
      rippleValue.setValue(0);
      Animated.timing(rippleValue, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: false,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (scaleOnPress && !disabled && !loading) {
      setIsPressed(false);
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: ANIMATION_PRESETS.button.release.duration,
        easing: ANIMATION_PRESETS.button.release.easing,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePress = async () => {
    if (!disabled && !loading) {
      try {
        await onPress();
        if (successAnimation) {
          setIsSuccess(true);
        }
      } catch (error) {
        if (shakeOnError || errorAnimation) {
          setIsError(true);
        }
      }
    }
  };

  const rippleOpacity = rippleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0],
  });

  const rippleScale = rippleValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glowOpacity = glowValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const loadingRotation = loadingValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shakeTranslateX = shakeValue.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: [-10, 0, 10],
  });

  // 獲取變體樣式
  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.gold.primary,
          borderColor: theme.colors.gold.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.primary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: theme.colors.gold.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.status.error,
          borderColor: theme.colors.status.error,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.status.success,
          borderColor: theme.colors.status.success,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.background.tertiary,
          borderColor: theme.colors.border.primary,
        };
    }
  };

  // 獲取尺寸樣式
  const getSizeStyles = (): ViewStyle => {
    const sizeMap = {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 40,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
    };
    return sizeMap[size];
  };

  // 獲取文字樣式
  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: theme.typography.weights.medium as any,
    };

    const sizeMap = {
      small: { fontSize: theme.typography.sizes.sm },
      medium: { fontSize: theme.typography.sizes.base },
      large: { fontSize: theme.typography.sizes.lg },
    };

    const variantColorMap = {
      primary: { color: theme.colors.background.primary },
      secondary: { color: theme.colors.text.primary },
      outline: { color: theme.colors.gold.primary },
      ghost: { color: theme.colors.text.primary },
      danger: { color: theme.colors.background.primary },
      success: { color: theme.colors.background.primary },
      default: { color: theme.colors.text.primary },
    };

    return {
      ...baseStyle,
      ...sizeMap[size],
      ...variantColorMap[variant],
    };
  };

  // 獲取圖標顏色
  const getIconColor = (): string => {
    if (iconColor) return iconColor;

    const variantColorMap = {
      primary: theme.colors.background.primary,
      secondary: theme.colors.text.primary,
      outline: theme.colors.gold.primary,
      ghost: theme.colors.text.primary,
      danger: theme.colors.background.primary,
      success: theme.colors.background.primary,
      default: theme.colors.text.primary,
    };

    return variantColorMap[variant];
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
      disabled={disabled || loading}
      style={[styles.touchable]}
    >
      <Animated.View
        style={[
          styles.container,
          getVariantStyles(),
          getSizeStyles(),
          {
            transform: [
              { scale: scaleValue },
              { scale: pulseValue },
              { translateX: shakeTranslateX },
            ],
            opacity: disabled ? 0.5 : 1,
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

        {/* 漣漪效果 */}
        {rippleEffect && (
          <Animated.View
            style={[
              styles.rippleEffect,
              {
                opacity: rippleOpacity,
                transform: [{ scale: rippleScale }],
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
              { backgroundColor: badgeColor || theme.colors.status.error },
            ]}
          >
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        {/* 左側圖標 */}
        {icon && iconPosition === 'left' && !loading && (
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}

        {/* 加載圖標 */}
        {loading && (
          <Animated.View
            style={[
              styles.loadingIcon,
              {
                transform: [{ rotate: loadingRotation }],
              },
            ]}
          >
            <Ionicons name="refresh" size={iconSize} color={getIconColor()} />
          </Animated.View>
        )}

        {/* 文字內容 */}
        <Text style={[styles.text, getTextStyles(), textStyle]}>
          {children}
        </Text>

        {/* 右側圖標 */}
        {icon && iconPosition === 'right' && !loading && (
          <Ionicons
            name={icon as any}
            size={iconSize}
            color={getIconColor()}
            style={styles.rightIcon}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
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
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: theme.borderRadius.lg,
    zIndex: -1,
  },
  rippleEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -50,
    marginLeft: -50,
    zIndex: 1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    zIndex: 2,
  },
  badgeText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
  },
  loadingIcon: {
    marginRight: theme.spacing.xs,
  },
});

// 特殊動畫按鈕組件
export const PulseButton: React.FC<
  Omit<AnimatedButtonProps, 'scaleOnPress' | 'rippleEffect' | 'pulseEffect'> & {
    pulseColor?: string;
    pulseDuration?: number;
  }
> = ({
  children,
  onPress,
  style,
  disabled = false,
  pulseColor = theme.colors.gold.primary,
  pulseDuration = 2000,
  ...props
}) => {
  const pulseValue = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!disabled) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: false,
          }),
          Animated.timing(pulseValue, {
            toValue: 0,
            duration: pulseDuration,
            useNativeDriver: false,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    }
  }, [disabled, pulseValue, pulseDuration]);

  const pulseOpacity = pulseValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <AnimatedButton
      onPress={onPress}
      style={[styles.pulseContainer, style]}
      disabled={disabled}
      pulseEffect={true}
      {...props}
    >
      {children}
      <Animated.View
        style={[
          styles.pulseEffect,
          {
            backgroundColor: pulseColor,
            opacity: pulseOpacity,
          },
        ]}
      />
    </AnimatedButton>
  );
};

// 搖擺動畫按鈕
export const ShakeButton: React.FC<
  Omit<AnimatedButtonProps, 'scaleOnPress' | 'rippleEffect'> & {
    shakeOnPress?: boolean;
  }
> = ({
  children,
  onPress,
  style,
  disabled = false,
  shakeOnPress = false,
  ...props
}) => {
  const shakeValue = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    if (shakeOnPress && !disabled) {
      const shakeAnimation = animationComposers.errorShake(shakeValue);
      shakeAnimation.start();
    }
    onPress();
  };

  const shakeTranslateX = shakeValue.interpolate({
    inputRange: [-10, 0, 10],
    outputRange: [-10, 0, 10],
  });

  return (
    <AnimatedButton
      onPress={handlePress}
      style={[
        style,
        {
          transform: [{ translateX: shakeTranslateX }],
        },
      ]}
      disabled={disabled}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
};

// 成功動畫按鈕
export const SuccessButton: React.FC<
  Omit<AnimatedButtonProps, 'successAnimation'> & {
    onSuccess?: () => void;
  }
> = ({ children, onPress, onSuccess, style, disabled = false, ...props }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    try {
      await onPress();
      setIsSuccess(true);

      const successAnimation = animationComposers.successCelebration(
        scaleValue,
        rotateValue,
        scaleValue
      );
      successAnimation.start(() => {
        setIsSuccess(false);
        onSuccess?.();
      });
    } catch (error) {
      // 處理錯誤
    }
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AnimatedButton
      onPress={handlePress}
      style={[
        style,
        {
          transform: [{ scale: scaleValue }, { rotate }],
        },
      ]}
      disabled={disabled || isSuccess}
      {...props}
    >
      {isSuccess ? (
        <Ionicons
          name="checkmark"
          size={20}
          color={theme.colors.text.inverse}
        />
      ) : (
        children
      )}
    </AnimatedButton>
  );
};

// 預定義的動畫按鈕
export const PrimaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (
  props
) => <AnimatedButton {...props} variant="primary" />;

export const SecondaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (
  props
) => <AnimatedButton {...props} variant="secondary" />;

export const OutlineButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (
  props
) => <AnimatedButton {...props} variant="outline" />;

export const GhostButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (
  props
) => <AnimatedButton {...props} variant="ghost" />;

export const DangerButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (
  props
) => <AnimatedButton {...props} variant="danger" />;

export const SuccessButtonVariant: React.FC<
  Omit<AnimatedButtonProps, 'variant'>
> = (props) => <AnimatedButton {...props} variant="success" />;
