import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/config/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
  margin = 'none'
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    (styles as any)[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
    (styles as any)[`margin${margin.charAt(0).toUpperCase() + margin.slice(1)}`],
    style
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.background
  },

  // Variants
  elevated: {
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },

  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border
  },

  filled: {
    backgroundColor: theme.colors.backgroundSecondary
  },

  // Padding
  paddingNone: {
    padding: 0
  },
  paddingSmall: {
    padding: theme.spacing.small
  },
  paddingMedium: {
    padding: theme.spacing.medium
  },
  paddingLarge: {
    padding: theme.spacing.large
  },

  // Margin
  marginNone: {
    margin: 0
  },
  marginSmall: {
    margin: theme.spacing.small
  },
  marginMedium: {
    margin: theme.spacing.medium
  },
  marginLarge: {
    margin: theme.spacing.large
  }
});
