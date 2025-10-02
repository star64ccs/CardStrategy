import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import type { AccessibilityRole, TextStyle, ViewStyle } from 'react-native';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

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

const Button: React.FC<ButtonProps> = ({
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
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const variantStyle = styles[variant];
    const sizeStyle = styles[size];
    const disabledStyle = disabled ? styles.disabled : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = styles.text;
    const variantTextStyle = styles[`${variant}Text`];
    const sizeTextStyle = styles[`${size}Text`];
    const disabledTextStyle = disabled ? styles.disabledText : {};

    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...sizeTextStyle,
      ...disabledTextStyle,
      ...textStyle,
    };
  };

  const getIconColor = (): string => {
    if (disabled) return '#999';
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
        return '#007AFF';
      case 'outline':
        return '#007AFF';
      case 'ghost':
        return '#007AFF';
      default:
        return '#fff';
    }
  };

  const renderIcon = () => {
    if (!icon) return null;

    const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
    const iconColor = getIconColor();

    if (typeof icon === 'string') {
      return (
        <Ionicons
          name={icon as any}
          size={iconSize}
          color={iconColor}
          style={[
            iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
            styles.icon,
          ]}
          testID='button-icon'
        />
      );
    }

    const IconComponent = icon;
    return (
      <IconComponent
        size={iconSize}
        color={iconColor}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
          styles.icon,
        ]}
        testID='button-icon'
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator
            size='small'
            color={variant === 'primary' ? '#fff' : '#007AFF'}
            style={styles.loadingIndicator}
            testID='loading-indicator'
          />
          <Text style={getTextStyle()}>{loadingText || '載入中...'}</Text>
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && renderIcon()}
        <Text style={getTextStyle()}>{title}</Text>
        {icon && iconPosition === 'right' && renderIcon()}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled || loading}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole}
      accessibilityState={{
        disabled: disabled || loading,
      }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  // Variants
  primary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  primaryText: {
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderColor: '#F2F2F7',
  },
  secondaryText: {
    color: '#007AFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  ghostText: {
    color: '#007AFF',
  },
  // Sizes
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  smallText: {
    fontSize: 14,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  mediumText: {
    fontSize: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  largeText: {
    fontSize: 18,
  },
  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#999',
  },
});

export default Button;
