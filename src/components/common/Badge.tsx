import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/config/theme';

export interface BadgeProps {
  text: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle
}) => {
  const badgeStyle = [
    styles.base,
    styles[variant],
    styles[size],
    style
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyleCombined}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.small
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary
  },
  primaryText: {
    color: theme.colors.white
  },

  secondary: {
    backgroundColor: theme.colors.secondary
  },
  secondaryText: {
    color: theme.colors.white
  },

  success: {
    backgroundColor: theme.colors.success
  },
  successText: {
    color: theme.colors.white
  },

  warning: {
    backgroundColor: theme.colors.warning
  },
  warningText: {
    color: theme.colors.white
  },

  error: {
    backgroundColor: theme.colors.error
  },
  errorText: {
    color: theme.colors.white
  },

  info: {
    backgroundColor: theme.colors.info
  },
  infoText: {
    color: theme.colors.white
  },

  // Sizes
  small: {
    paddingVertical: 2,
    minWidth: 16,
    height: 16
  },
  smallText: {
    fontSize: 10,
    fontWeight: '600'
  },

  medium: {
    paddingVertical: 4,
    minWidth: 20,
    height: 20
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '600'
  },

  large: {
    paddingVertical: 6,
    minWidth: 24,
    height: 24
  },
  largeText: {
    fontSize: 14,
    fontWeight: '600'
  },

  text: {
    textAlign: 'center'
  }
});
