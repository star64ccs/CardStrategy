import React from 'react';
import type { AccessibilityRole, TextStyle, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
// Mock Ionicons for testing
const _Ionicons = ({ name, size, color, style }: unknown) => null;

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  onLongPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: string | React.ComponentType<any>;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  onLongPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}) => {
  const _handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  const _handleLongPress = () => {
    if (!disabled && !loading && onLongPress) {
      onLongPress();
    }
  };

  const _renderIcon = () => {
    if (!icon || loading) return null;

    const _iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const _iconColor = getIconColor();

    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={iconColor}
          style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
        />
      );
    }

    const _IconComponent = icon;
    return (
      <IconComponent
        size={iconSize}
        color={iconColor}
        style={iconPosition === 'right' ? styles.iconRight : styles.iconLeft}
      />
    );
  };

  const _getIconColor = () => {
    if (disabled) return '#999';
    if (variant === 'outline' || variant === 'ghost') return '#007AFF';
    return '#FFFFFF';
  };

  const _getButtonStyle = (): ViewStyle => {
    const _baseStyle = [styles.button, styles[size], styles[variant]];

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    if (loading) {
      baseStyle.push(styles.loading as any);
    }

    return StyleSheet.flatten([...baseStyle, style || {}] as any) as ViewStyle;
  };

  const _getTextStyle = (): TextStyle => {
    const _baseStyle = [
      styles.text,
      styles[`${size}Text`],
      styles[`${variant}Text`],
    ];

    if (disabled) {
      baseStyle.push(styles.disabledText);
    }

    return StyleSheet.flatten([
      ...baseStyle,
      textStyle || {},
    ] as any) as TextStyle;
  };

  const _displayText = loading ? loadingText || title : title;

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      onLongPress={handleLongPress}
      disabled={disabled || loading}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading && (
        <ActivityIndicator
          size='small'
          color={
            variant === 'outline' || variant === 'ghost' ? '#007AFF' : '#FFFFFF'
          }
          style={styles.loadingIndicator}
        />
      )}

      {!loading && iconPosition === 'left' && renderIcon()}

      <Text style={getTextStyle()}>{displayText}</Text>

      {!loading && iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

const _styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Size variants
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },

  // Variant styles
  primary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
    borderColor: '#5856D6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },

  // Variant text styles
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghostText: {
    color: '#007AFF',
  },

  // State styles
  disabled: {
    backgroundColor: '#E5E5EA',
    borderColor: '#E5E5EA',
  },
  disabledText: {
    color: '#999',
  },
  loading: {
    opacity: 0.7,
  },

  // Icon styles
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },

  // Loading indicator
  loadingIndicator: {
    marginRight: 8,
  },
});

export default Button;
