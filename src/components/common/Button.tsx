import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../../theme/designSystem';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.lg,
      borderWidth: variant === 'secondary' ? 1 : 0,
      shadowColor:
        variant === 'primary' ? theme.colors.gold.primary : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: variant === 'primary' ? 0.3 : 0,
      shadowRadius: 4,
      elevation: variant === 'primary' ? 4 : 0,
    };

    // 尺寸樣式
    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
      },
    };

    // 變體樣式
    const variantStyles = {
      primary: {
        backgroundColor: disabled
          ? theme.colors.text.disabled
          : theme.colors.gold.primary,
        borderColor: disabled
          ? theme.colors.text.disabled
          : theme.colors.gold.primary,
      },
      secondary: {
        backgroundColor: 'transparent',
        borderColor: disabled
          ? theme.colors.text.disabled
          : theme.colors.gold.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.semibold,
      textAlign: 'center',
    };

    const sizeStyles = {
      small: { fontSize: theme.typography.sizes.sm },
      medium: { fontSize: theme.typography.sizes.base },
      large: { fontSize: theme.typography.sizes.lg },
    };

    const variantStyles = {
      primary: {
        color: theme.colors.background.primary,
      },
      secondary: {
        color: disabled
          ? theme.colors.text.disabled
          : theme.colors.gold.primary,
      },
      ghost: {
        color: disabled
          ? theme.colors.text.disabled
          : theme.colors.text.primary,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? theme.colors.background.primary
              : theme.colors.gold.primary
          }
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
