import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle
} from 'react-native';
import { theme } from '../../theme/designSystem';

interface BadgeProps {
  text: string | number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  showDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  showDot = false
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.full
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        minWidth: 16,
        height: 16
      },
      medium: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        minWidth: 20,
        height: 20
      },
      large: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minWidth: 24,
        height: 24
      }
    };

    const variantStyles = {
      default: {
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.primary,
        borderWidth: 1
      },
      success: {
        backgroundColor: theme.colors.status.success,
        borderColor: theme.colors.status.success,
        borderWidth: 0
      },
      warning: {
        backgroundColor: theme.colors.status.warning,
        borderColor: theme.colors.status.warning,
        borderWidth: 0
      },
      error: {
        backgroundColor: theme.colors.status.error,
        borderColor: theme.colors.status.error,
        borderWidth: 0
      },
      info: {
        backgroundColor: theme.colors.status.info,
        borderColor: theme.colors.status.info,
        borderWidth: 0
      },
      gold: {
        backgroundColor: theme.colors.gold.primary,
        borderColor: theme.colors.gold.primary,
        borderWidth: 0
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: theme.typography.weights.medium,
      textAlign: 'center'
    };

    const sizeStyles = {
      small: { fontSize: theme.typography.sizes.xs },
      medium: { fontSize: theme.typography.sizes.sm },
      large: { fontSize: theme.typography.sizes.base }
    };

    const variantStyles = {
      default: {
        color: theme.colors.text.secondary
      },
      success: {
        color: theme.colors.text.primary
      },
      warning: {
        color: theme.colors.text.primary
      },
      error: {
        color: theme.colors.text.primary
      },
      info: {
        color: theme.colors.text.primary
      },
      gold: {
        color: theme.colors.background.primary
      }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant]
    };
  };

  const getDotStyle = (): ViewStyle => {
    const dotSizes = {
      small: { width: 4, height: 4 },
      medium: { width: 6, height: 6 },
      large: { width: 8, height: 8 }
    };

    return {
      width: dotSizes[size].width,
      height: dotSizes[size].height,
      borderRadius: dotSizes[size].width / 2,
      backgroundColor: variant === 'gold' ? theme.colors.background.primary : theme.colors.text.primary,
      marginRight: theme.spacing.xs
    };
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {showDot && <View style={getDotStyle()} />}
      <Text style={[getTextStyle(), textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
