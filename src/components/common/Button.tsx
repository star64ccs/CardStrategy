import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/config/ThemeProvider';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
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
  fullWidth = false,
  style,
  textStyle,
  icon
}) => {
  const { theme } = useTheme();

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[textStyleCombined, { color: getTextColor(variant, disabled) }]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// 獲取文字顏色的輔助函數
const getTextColor = (variant: string, disabled: boolean) => {
  if (disabled) return '#9CA3AF';

  switch (variant) {
    case 'primary':
    case 'secondary':
    case 'danger':
      return '#FFFFFF';
    case 'outline':
    case 'ghost':
      return '#1C2B3A';
    default:
      return '#1C2B3A';
  }
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.6
  },
  text: {
    fontWeight: '600',
    textAlign: 'center'
  },

  // Variants
  primary: {
    backgroundColor: '#1C2B3A'
  },
  primaryText: {
    color: '#FFFFFF'
  },

  secondary: {
    backgroundColor: '#CBA135'
  },
  secondaryText: {
    color: '#FFFFFF'
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1C2B3A'
  },
  outlineText: {
    color: '#1C2B3A'
  },

  ghost: {
    backgroundColor: 'transparent'
  },
  ghostText: {
    color: '#1C2B3A'
  },

  danger: {
    backgroundColor: '#F44336'
  },
  dangerText: {
    color: '#FFFFFF'
  },

  disabledText: {
    color: '#6B7280'
  },

  // Sizes
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32
  },
  smallText: {
    fontSize: 12
  },

  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44
  },
  mediumText: {
    fontSize: 14
  },

  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56
  },
  largeText: {
    fontSize: 16
  }
});
